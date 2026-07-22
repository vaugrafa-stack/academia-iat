Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.IO.Compression.FileSystem
Add-Type -AssemblyName System.Drawing

$Workspace = 'C:\Users\rafae\OneDrive\Documentos\New project\apps\iat_training'
$DataDir = Join-Path $Workspace 'src\data'
$AssetDir = Join-Path $Workspace 'public\source-assets'
$Sources = @(
    [ordered]@{
        id = 'pop'
        kind = 'standard-operating-procedure'
        title = 'POP de Licenciamento Ambiental de Empreendimentos Hidrelétricos no IAT'
        path = 'C:\Users\rafae\Downloads\POP_Licenciamento_Hidreletricas_IAT_Julho_2026_PACUERA_Integrado_Auditado_V1.2_Corrigido.docx'
        output = 'pop-content.json'
        assetPrefix = 'pop'
    },
    [ordered]@{
        id = 'fluxogramas'
        kind = 'flowchart-proposal'
        title = 'Proposta de Fluxogramas: versões original, simplificada e completa'
        path = 'C:\Users\rafae\Downloads\Proposta de Fluxogramas (Original, Simplificado e Detalhado).docx'
        output = 'flowcharts-content.json'
        assetPrefix = 'flow'
    }
)

$W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
$R = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
$A = 'http://schemas.openxmlformats.org/drawingml/2006/main'
$WP = 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing'
$REL = 'http://schemas.openxmlformats.org/package/2006/relationships'

function Read-ZipText {
    param([System.IO.Compression.ZipArchive]$Zip, [string]$Name)
    $entry = $Zip.GetEntry($Name)
    if (-not $entry) { return $null }
    $reader = [System.IO.StreamReader]::new($entry.Open(), [System.Text.Encoding]::UTF8, $true)
    try { return $reader.ReadToEnd() } finally { $reader.Dispose() }
}

function Read-ZipXml {
    param([System.IO.Compression.ZipArchive]$Zip, [string]$Name)
    $text = Read-ZipText -Zip $Zip -Name $Name
    if ($null -eq $text) { return $null }
    return [xml]$text
}

function New-NamespaceManager {
    param([xml]$Xml)
    $ns = [System.Xml.XmlNamespaceManager]::new($Xml.NameTable)
    $ns.AddNamespace('w', $W)
    $ns.AddNamespace('r', $R)
    $ns.AddNamespace('a', $A)
    $ns.AddNamespace('wp', $WP)
    $ns.AddNamespace('pr', $REL)
    return ,$ns
}

function Get-WAttr {
    param([System.Xml.XmlElement]$Node, [string]$Name)
    if (-not $Node) { return $null }
    $value = $Node.GetAttribute($Name, $W)
    if ([string]::IsNullOrEmpty($value)) { return $null }
    return $value
}

function Get-RAttr {
    param([System.Xml.XmlElement]$Node, [string]$Name)
    if (-not $Node) { return $null }
    $value = $Node.GetAttribute($Name, $R)
    if ([string]::IsNullOrEmpty($value)) { return $null }
    return $value
}

function Get-BoolProperty {
    param([System.Xml.XmlElement]$Node)
    if (-not $Node) { return $false }
    $value = Get-WAttr -Node $Node -Name 'val'
    return ($value -notin @('0', 'false', 'off'))
}

function Get-VisibleText {
    param([System.Xml.XmlNode]$Node)
    $parts = [System.Collections.Generic.List[string]]::new()
    foreach ($item in $Node.SelectNodes('.//*')) {
        switch ($item.LocalName) {
            't' { $parts.Add($item.InnerText) }
            'tab' { $parts.Add("`t") }
            'br' { $parts.Add("`n") }
            'cr' { $parts.Add("`n") }
            'noBreakHyphen' { $parts.Add([char]0x2011) }
            'softHyphen' { $parts.Add([char]0x00AD) }
        }
    }
    return ($parts -join '')
}

function Resolve-PartTarget {
    param([string]$BasePart, [string]$Target)
    if ($Target -match '^[a-zA-Z][a-zA-Z0-9+.-]*:') { return $Target }
    if ($Target.StartsWith('/')) { return $Target.TrimStart('/') }
    $segments = [System.Collections.Generic.List[string]]::new()
    $base = $BasePart.Replace('\', '/').Split('/')
    for ($i = 0; $i -lt $base.Length - 1; $i++) { if ($base[$i]) { $segments.Add($base[$i]) } }
    foreach ($part in $Target.Replace('\', '/').Split('/')) {
        if ($part -eq '..') {
            if ($segments.Count -gt 0) { $segments.RemoveAt($segments.Count - 1) }
        } elseif ($part -and $part -ne '.') {
            $segments.Add($part)
        }
    }
    return ($segments -join '/')
}

function Get-RelationshipMap {
    param([System.IO.Compression.ZipArchive]$Zip, [string]$PartName)
    $dir = [System.IO.Path]::GetDirectoryName($PartName).Replace('\', '/')
    $file = [System.IO.Path]::GetFileName($PartName)
    $relsPart = if ($dir) { "$dir/_rels/$file.rels" } else { "_rels/$file.rels" }
    $xml = Read-ZipXml -Zip $Zip -Name $relsPart
    $map = [System.Collections.Generic.Dictionary[string, object]]::new([System.StringComparer]::OrdinalIgnoreCase)
    if (-not $xml) { return ,$map }
    foreach ($rel in $xml.DocumentElement.ChildNodes) {
        if ($rel.LocalName -ne 'Relationship') { continue }
        $target = $rel.GetAttribute('Target')
        $map[$rel.GetAttribute('Id')] = [ordered]@{
            id = $rel.GetAttribute('Id')
            type = $rel.GetAttribute('Type')
            target = $target
            targetMode = $rel.GetAttribute('TargetMode')
            resolvedPart = Resolve-PartTarget -BasePart $PartName -Target $target
        }
    }
    return ,$map
}

function Get-Properties {
    param([System.IO.Compression.ZipArchive]$Zip, [string]$Part)
    $xml = Read-ZipXml -Zip $Zip -Name $Part
    $result = [ordered]@{}
    if (-not $xml) { return $result }
    foreach ($node in $xml.DocumentElement.ChildNodes) {
        if ($node.NodeType -ne [System.Xml.XmlNodeType]::Element) { continue }
        $key = $node.LocalName
        $value = $node.InnerText
        if ($result.Contains($key)) {
            if ($result[$key] -isnot [System.Collections.IList]) { $result[$key] = @($result[$key]) }
            $result[$key] += $value
        } else {
            $result[$key] = $value
        }
    }
    return $result
}

function Get-Styles {
    param([System.IO.Compression.ZipArchive]$Zip)
    $xml = Read-ZipXml -Zip $Zip -Name 'word/styles.xml'
    $map = [System.Collections.Generic.Dictionary[string, object]]::new([System.StringComparer]::OrdinalIgnoreCase)
    if (-not $xml) { return ,$map }
    $ns = New-NamespaceManager -Xml $xml
    foreach ($style in $xml.SelectNodes('//w:style', $ns)) {
        $id = Get-WAttr -Node $style -Name 'styleId'
        $nameNode = $style.SelectSingleNode('./w:name', $ns)
        $basedNode = $style.SelectSingleNode('./w:basedOn', $ns)
        $outlineNode = $style.SelectSingleNode('./w:pPr/w:outlineLvl', $ns)
        $numNode = $style.SelectSingleNode('./w:pPr/w:numPr/w:numId', $ns)
        $ilvlNode = $style.SelectSingleNode('./w:pPr/w:numPr/w:ilvl', $ns)
        $map[$id] = [ordered]@{
            id = $id
            type = Get-WAttr -Node $style -Name 'type'
            name = if ($nameNode) { Get-WAttr -Node $nameNode -Name 'val' } else { $id }
            basedOn = if ($basedNode) { Get-WAttr -Node $basedNode -Name 'val' } else { $null }
            isDefault = ((Get-WAttr -Node $style -Name 'default') -eq '1')
            isQuickStyle = [bool]$style.SelectSingleNode('./w:qFormat', $ns)
            outlineLevel = if ($outlineNode) { [int](Get-WAttr -Node $outlineNode -Name 'val') } else { $null }
            numId = if ($numNode) { Get-WAttr -Node $numNode -Name 'val' } else { $null }
            listLevel = if ($ilvlNode) { [int](Get-WAttr -Node $ilvlNode -Name 'val') } else { $null }
        }
    }
    return ,$map
}

function Get-EffectiveStyleValue {
    param(
        [System.Collections.Generic.Dictionary[string, object]]$Styles,
        [string]$StyleId,
        [string]$Property
    )
    $seen = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
    $current = $StyleId
    while ($current -and $Styles.ContainsKey($current) -and $seen.Add($current)) {
        $style = $Styles[$current]
        if ($null -ne $style[$Property]) { return $style[$Property] }
        $current = $style['basedOn']
    }
    return $null
}

function Get-Numbering {
    param([System.IO.Compression.ZipArchive]$Zip)
    $xml = Read-ZipXml -Zip $Zip -Name 'word/numbering.xml'
    $abstract = [System.Collections.Generic.Dictionary[string, object]]::new()
    $numbers = [System.Collections.Generic.Dictionary[string, object]]::new()
    if (-not $xml) { return [ordered]@{ abstract = $abstract; numbers = $numbers } }
    $ns = New-NamespaceManager -Xml $xml
    foreach ($abs in $xml.SelectNodes('//w:abstractNum', $ns)) {
        $id = Get-WAttr -Node $abs -Name 'abstractNumId'
        $levels = [System.Collections.Generic.List[object]]::new()
        foreach ($lvl in $abs.SelectNodes('./w:lvl', $ns)) {
            $ilvl = [int](Get-WAttr -Node $lvl -Name 'ilvl')
            $start = $lvl.SelectSingleNode('./w:start', $ns)
            $format = $lvl.SelectSingleNode('./w:numFmt', $ns)
            $text = $lvl.SelectSingleNode('./w:lvlText', $ns)
            $suffix = $lvl.SelectSingleNode('./w:suff', $ns)
            $align = $lvl.SelectSingleNode('./w:lvlJc', $ns)
            $left = $lvl.SelectSingleNode('./w:pPr/w:ind', $ns)
            $font = $lvl.SelectSingleNode('./w:rPr/w:rFonts', $ns)
            $levels.Add([ordered]@{
                level = $ilvl
                start = if ($start) { [int](Get-WAttr -Node $start -Name 'val') } else { 1 }
                format = if ($format) { Get-WAttr -Node $format -Name 'val' } else { $null }
                levelText = if ($text) { Get-WAttr -Node $text -Name 'val' } else { $null }
                suffix = if ($suffix) { Get-WAttr -Node $suffix -Name 'val' } else { $null }
                alignment = if ($align) { Get-WAttr -Node $align -Name 'val' } else { $null }
                leftTwips = if ($left) { Get-WAttr -Node $left -Name 'left' } else { $null }
                hangingTwips = if ($left) { Get-WAttr -Node $left -Name 'hanging' } else { $null }
                font = if ($font) { Get-WAttr -Node $font -Name 'ascii' } else { $null }
            })
        }
        $abstract[$id] = [ordered]@{ id = $id; levels = @($levels) }
    }
    foreach ($num in $xml.SelectNodes('//w:num', $ns)) {
        $id = Get-WAttr -Node $num -Name 'numId'
        $absNode = $num.SelectSingleNode('./w:abstractNumId', $ns)
        $absId = if ($absNode) { Get-WAttr -Node $absNode -Name 'val' } else { $null }
        $numbers[$id] = [ordered]@{
            id = $id
            abstractNumId = $absId
            levels = if ($absId -and $abstract.ContainsKey($absId)) { $abstract[$absId]['levels'] } else { @() }
        }
    }
    return [ordered]@{ abstract = $abstract; numbers = $numbers }
}

function Get-ListInfo {
    param(
        [System.Xml.XmlElement]$Paragraph,
        [System.Xml.XmlNamespaceManager]$Ns,
        [System.Collections.Generic.Dictionary[string, object]]$Styles,
        [System.Collections.Generic.Dictionary[string, object]]$Numbers,
        [string]$StyleId
    )
    $numNode = $Paragraph.SelectSingleNode('./w:pPr/w:numPr/w:numId', $Ns)
    $lvlNode = $Paragraph.SelectSingleNode('./w:pPr/w:numPr/w:ilvl', $Ns)
    $numId = if ($numNode) { Get-WAttr -Node $numNode -Name 'val' } else { Get-EffectiveStyleValue -Styles $Styles -StyleId $StyleId -Property 'numId' }
    if ($null -eq $numId -or $numId -eq '0') { return $null }
    $level = if ($lvlNode) { [int](Get-WAttr -Node $lvlNode -Name 'val') } else {
        $styleLevel = Get-EffectiveStyleValue -Styles $Styles -StyleId $StyleId -Property 'listLevel'
        if ($null -eq $styleLevel) { 0 } else { [int]$styleLevel }
    }
    $definition = $null
    if ($Numbers.ContainsKey([string]$numId)) {
        $candidate = @($Numbers[[string]$numId]['levels'] | Where-Object { $_['level'] -eq $level })
        if ($candidate.Count -gt 0) { $definition = $candidate[0] }
    }
    return [ordered]@{
        numId = [string]$numId
        level = $level
        type = if ($definition -and $definition['format'] -eq 'bullet') { 'bullet' } else { 'ordered' }
        format = if ($definition) { $definition['format'] } else { $null }
        markerPattern = if ($definition) { $definition['levelText'] } else { $null }
        start = if ($definition) { $definition['start'] } else { $null }
    }
}

function Get-Runs {
    param(
        [System.Xml.XmlElement]$Paragraph,
        [System.Xml.XmlNamespaceManager]$Ns,
        [System.Collections.Generic.Dictionary[string, object]]$Relationships
    )
    $result = [System.Collections.Generic.List[object]]::new()
    foreach ($run in $Paragraph.SelectNodes('.//w:r', $Ns)) {
        $text = Get-VisibleText -Node $run
        if ([string]::IsNullOrEmpty($text)) { continue }
        $props = $run.SelectSingleNode('./w:rPr', $Ns)
        $hyperlinkNode = $run.ParentNode
        while ($hyperlinkNode -and $hyperlinkNode.LocalName -ne 'p' -and $hyperlinkNode.LocalName -ne 'hyperlink') { $hyperlinkNode = $hyperlinkNode.ParentNode }
        $link = $null
        if ($hyperlinkNode -and $hyperlinkNode.LocalName -eq 'hyperlink') {
            $relId = Get-RAttr -Node $hyperlinkNode -Name 'id'
            $anchor = Get-WAttr -Node $hyperlinkNode -Name 'anchor'
            $link = [ordered]@{
                relationshipId = $relId
                anchor = $anchor
                url = if ($relId -and $Relationships.ContainsKey($relId)) { $Relationships[$relId]['target'] } else { $null }
            }
        }
        $revision = $null
        $ancestor = $run.ParentNode
        while ($ancestor -and $ancestor.LocalName -ne 'p') {
            if ($ancestor.LocalName -in @('ins', 'del')) { $revision = $ancestor.LocalName; break }
            $ancestor = $ancestor.ParentNode
        }
        $result.Add([ordered]@{
            text = $text
            bold = if ($props) { Get-BoolProperty -Node $props.SelectSingleNode('./w:b', $Ns) } else { $false }
            italic = if ($props) { Get-BoolProperty -Node $props.SelectSingleNode('./w:i', $Ns) } else { $false }
            underline = if ($props -and $props.SelectSingleNode('./w:u', $Ns)) { Get-WAttr -Node $props.SelectSingleNode('./w:u', $Ns) -Name 'val' } else { $null }
            color = if ($props -and $props.SelectSingleNode('./w:color', $Ns)) { Get-WAttr -Node $props.SelectSingleNode('./w:color', $Ns) -Name 'val' } else { $null }
            highlight = if ($props -and $props.SelectSingleNode('./w:highlight', $Ns)) { Get-WAttr -Node $props.SelectSingleNode('./w:highlight', $Ns) -Name 'val' } else { $null }
            language = if ($props -and $props.SelectSingleNode('./w:lang', $Ns)) { Get-WAttr -Node $props.SelectSingleNode('./w:lang', $Ns) -Name 'val' } else { $null }
            superscript = ($props -and $props.SelectSingleNode('./w:vertAlign[@w:val="superscript"]', $Ns)) -ne $null
            subscript = ($props -and $props.SelectSingleNode('./w:vertAlign[@w:val="subscript"]', $Ns)) -ne $null
            hyperlink = $link
            revision = $revision
        })
    }
    return @($result)
}

function Get-ImagesInNode {
    param(
        [System.Xml.XmlNode]$Node,
        [System.Xml.XmlNamespaceManager]$Ns,
        [System.Collections.Generic.Dictionary[string, object]]$Relationships,
        [System.Collections.Generic.Dictionary[string, object]]$AssetByPart
    )
    $images = [System.Collections.Generic.List[object]]::new()
    foreach ($blip in $Node.SelectNodes('.//a:blip', $Ns)) {
        $relId = Get-RAttr -Node $blip -Name 'embed'
        if (-not $relId) { $relId = Get-RAttr -Node $blip -Name 'link' }
        $part = if ($relId -and $Relationships.ContainsKey($relId)) { $Relationships[$relId]['resolvedPart'] } else { $null }
        $asset = if ($part -and $AssetByPart.ContainsKey($part)) { $AssetByPart[$part] } else { $null }
        $container = $blip.ParentNode
        while ($container -and $container.LocalName -notin @('inline', 'anchor', 'p')) { $container = $container.ParentNode }
        $docPr = if ($container) { $container.SelectSingleNode('.//wp:docPr', $Ns) } else { $null }
        $extent = if ($container) { $container.SelectSingleNode('.//wp:extent', $Ns) } else { $null }
        $crop = $blip.ParentNode.SelectSingleNode('./a:srcRect', $Ns)
        $images.Add([ordered]@{
            relationshipId = $relId
            assetId = if ($asset) { $asset['id'] } else { $null }
            publicPath = if ($asset) { $asset['publicPath'] } else { $null }
            sourcePart = $part
            name = if ($docPr) { $docPr.GetAttribute('name') } else { $null }
            altText = if ($docPr) { $docPr.GetAttribute('descr') } else { $null }
            title = if ($docPr) { $docPr.GetAttribute('title') } else { $null }
            placement = if ($container) { $container.LocalName } else { $null }
            widthEmu = if ($extent) { $extent.GetAttribute('cx') } else { $null }
            heightEmu = if ($extent) { $extent.GetAttribute('cy') } else { $null }
            crop = if ($crop) { [ordered]@{ left = $crop.GetAttribute('l'); top = $crop.GetAttribute('t'); right = $crop.GetAttribute('r'); bottom = $crop.GetAttribute('b') } } else { $null }
        })
    }
    return @($images)
}

function Get-ParagraphObject {
    param(
        [System.Xml.XmlElement]$Paragraph,
        [System.Xml.XmlNamespaceManager]$Ns,
        [System.Collections.Generic.Dictionary[string, object]]$Styles,
        [System.Collections.Generic.Dictionary[string, object]]$Numbers,
        [System.Collections.Generic.Dictionary[string, object]]$Relationships,
        [System.Collections.Generic.Dictionary[string, object]]$AssetByPart,
        [string]$Id
    )
    $pPr = $Paragraph.SelectSingleNode('./w:pPr', $Ns)
    $styleNode = if ($pPr) { $pPr.SelectSingleNode('./w:pStyle', $Ns) } else { $null }
    $styleId = if ($styleNode) { Get-WAttr -Node $styleNode -Name 'val' } else { $null }
    $styleName = if ($styleId -and $Styles.ContainsKey($styleId)) { $Styles[$styleId]['name'] } else { $styleId }
    $outlineNode = if ($pPr) { $pPr.SelectSingleNode('./w:outlineLvl', $Ns) } else { $null }
    $outline = if ($outlineNode) { [int](Get-WAttr -Node $outlineNode -Name 'val') } else { Get-EffectiveStyleValue -Styles $Styles -StyleId $styleId -Property 'outlineLevel' }
    if ($null -eq $outline -and $styleId -match '^Heading\s*([1-9])$') { $outline = [int]$Matches[1] - 1 }
    $headingLevel = if ($null -ne $outline -and [int]$outline -lt 9) { [int]$outline + 1 } else { $null }
    $text = Get-VisibleText -Node $Paragraph
    $list = Get-ListInfo -Paragraph $Paragraph -Ns $Ns -Styles $Styles -Numbers $Numbers -StyleId $styleId
    $images = @(Get-ImagesInNode -Node $Paragraph -Ns $Ns -Relationships $Relationships -AssetByPart $AssetByPart)
    $semantic = if ($headingLevel) { 'heading' } elseif ($text -match '^(Quadro|Tabela|Figura)\s+\d+\s*[-–—]') { 'caption' } elseif ($list) { 'listItem' } elseif ($images.Count -gt 0 -and [string]::IsNullOrWhiteSpace($text)) { 'figure' } elseif ([string]::IsNullOrWhiteSpace($text)) { 'empty' } elseif ($text -match '^\s*(Nota|Atenção|Alerta)\b') { 'callout' } else { 'paragraph' }
    $alignmentNode = if ($pPr) { $pPr.SelectSingleNode('./w:jc', $Ns) } else { $null }
    $indentNode = if ($pPr) { $pPr.SelectSingleNode('./w:ind', $Ns) } else { $null }
    $spacingNode = if ($pPr) { $pPr.SelectSingleNode('./w:spacing', $Ns) } else { $null }
    $fields = @($Paragraph.SelectNodes('.//w:instrText', $Ns) | ForEach-Object { $_.InnerText.Trim() } | Where-Object { $_ })
    $bookmarks = @($Paragraph.SelectNodes('.//w:bookmarkStart', $Ns) | ForEach-Object { Get-WAttr -Node $_ -Name 'name' } | Where-Object { $_ })
    return [ordered]@{
        id = $Id
        semanticType = $semantic
        text = $text
        styleId = $styleId
        styleName = $styleName
        headingLevel = $headingLevel
        list = $list
        alignment = if ($alignmentNode) { Get-WAttr -Node $alignmentNode -Name 'val' } else { $null }
        indentation = if ($indentNode) { [ordered]@{ leftTwips = Get-WAttr -Node $indentNode -Name 'left'; rightTwips = Get-WAttr -Node $indentNode -Name 'right'; firstLineTwips = Get-WAttr -Node $indentNode -Name 'firstLine'; hangingTwips = Get-WAttr -Node $indentNode -Name 'hanging' } } else { $null }
        spacing = if ($spacingNode) { [ordered]@{ beforeTwips = Get-WAttr -Node $spacingNode -Name 'before'; afterTwips = Get-WAttr -Node $spacingNode -Name 'after'; line = Get-WAttr -Node $spacingNode -Name 'line'; lineRule = Get-WAttr -Node $spacingNode -Name 'lineRule' } } else { $null }
        keepWithNext = if ($pPr) { [bool]$pPr.SelectSingleNode('./w:keepNext', $Ns) } else { $false }
        pageBreakBefore = if ($pPr) { [bool]$pPr.SelectSingleNode('./w:pageBreakBefore', $Ns) } else { $false }
        runs = Get-Runs -Paragraph $Paragraph -Ns $Ns -Relationships $Relationships
        images = $images
        fields = $fields
        bookmarks = $bookmarks
    }
}

function Get-TableObject {
    param(
        [System.Xml.XmlElement]$Table,
        [System.Xml.XmlNamespaceManager]$Ns,
        [System.Collections.Generic.Dictionary[string, object]]$Styles,
        [System.Collections.Generic.Dictionary[string, object]]$Numbers,
        [System.Collections.Generic.Dictionary[string, object]]$Relationships,
        [System.Collections.Generic.Dictionary[string, object]]$AssetByPart,
        [string]$Id,
        [int]$TableIndex,
        [string]$DocumentId
    )
    $rows = [System.Collections.Generic.List[object]]::new()
    $paragraphCount = 0
    $maxColumns = 0
    $rowIndex = 0
    foreach ($row in $Table.SelectNodes('./w:tr', $Ns)) {
        $rowIndex++
        $cells = [System.Collections.Generic.List[object]]::new()
        $cellIndex = 0
        $gridColumns = 0
        foreach ($cell in $row.SelectNodes('./w:tc', $Ns)) {
            $cellIndex++
            $spanNode = $cell.SelectSingleNode('./w:tcPr/w:gridSpan', $Ns)
            $span = if ($spanNode) { [int](Get-WAttr -Node $spanNode -Name 'val') } else { 1 }
            $gridColumns += $span
            $vMergeNode = $cell.SelectSingleNode('./w:tcPr/w:vMerge', $Ns)
            $vMerge = if ($vMergeNode) { $v = Get-WAttr -Node $vMergeNode -Name 'val'; if ($v) { $v } else { 'continue' } } else { $null }
            $paragraphs = [System.Collections.Generic.List[object]]::new()
            $pIndex = 0
            foreach ($p in $cell.SelectNodes('./w:p', $Ns)) {
                $pIndex++
                $paragraphCount++
                $paragraphId = "$DocumentId-table-{0:D3}-r{1:D3}-c{2:D2}-p{3:D2}" -f $TableIndex, $rowIndex, $cellIndex, $pIndex
                $paragraphs.Add((Get-ParagraphObject -Paragraph $p -Ns $Ns -Styles $Styles -Numbers $Numbers -Relationships $Relationships -AssetByPart $AssetByPart -Id $paragraphId))
            }
            $cells.Add([ordered]@{
                index = $cellIndex
                gridSpan = $span
                verticalMerge = $vMerge
                verticalAlignment = if ($cell.SelectSingleNode('./w:tcPr/w:vAlign', $Ns)) { Get-WAttr -Node $cell.SelectSingleNode('./w:tcPr/w:vAlign', $Ns) -Name 'val' } else { $null }
                text = (@($paragraphs | ForEach-Object { $_['text'] }) -join "`n")
                paragraphs = @($paragraphs)
            })
        }
        if ($gridColumns -gt $maxColumns) { $maxColumns = $gridColumns }
        $rows.Add([ordered]@{
            index = $rowIndex
            isHeader = [bool]$row.SelectSingleNode('./w:trPr/w:tblHeader', $Ns)
            cells = @($cells)
        })
    }
    $styleNode = $Table.SelectSingleNode('./w:tblPr/w:tblStyle', $Ns)
    $layoutNode = $Table.SelectSingleNode('./w:tblPr/w:tblLayout', $Ns)
    $alignNode = $Table.SelectSingleNode('./w:tblPr/w:jc', $Ns)
    return [ordered]@{
        id = $Id
        sourceTableIndex = $TableIndex
        caption = $null
        labelType = $null
        labelNumber = $null
        title = $null
        navigationOnly = $false
        rowCount = $rows.Count
        columnCount = $maxColumns
        paragraphCount = $paragraphCount
        styleId = if ($styleNode) { Get-WAttr -Node $styleNode -Name 'val' } else { $null }
        alignment = if ($alignNode) { Get-WAttr -Node $alignNode -Name 'val' } else { $null }
        layout = if ($layoutNode) { Get-WAttr -Node $layoutNode -Name 'type' } else { $null }
        rows = @($rows)
    }
}

function Get-SupplementalParts {
    param([System.IO.Compression.ZipArchive]$Zip)
    $result = [System.Collections.Generic.List[object]]::new()
    $parts = @($Zip.Entries | Where-Object { $_.FullName -match '^word/(header|footer)\d*\.xml$' } | Sort-Object FullName)
    foreach ($entry in $parts) {
        $xml = Read-ZipXml -Zip $Zip -Name $entry.FullName
        $ns = New-NamespaceManager -Xml $xml
        $texts = @($xml.SelectNodes('//w:p', $ns) | ForEach-Object { Get-VisibleText -Node $_ } | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
        $result.Add([ordered]@{ part = $entry.FullName; text = ($texts -join "`n"); paragraphs = $texts })
    }
    return @($result)
}

function Export-Assets {
    param(
        [System.IO.Compression.ZipArchive]$Zip,
        [System.Collections.IDictionary]$Source,
        [string]$OutputDirectory
    )
    $assets = [System.Collections.Generic.List[object]]::new()
    $map = [System.Collections.Generic.Dictionary[string, object]]::new([System.StringComparer]::OrdinalIgnoreCase)
    $media = @($Zip.Entries | Where-Object { $_.FullName -like 'word/media/*' } | Sort-Object {
        if ($_.Name -match 'image(\d+)') { [int]$Matches[1] } else { [int]::MaxValue }
    }, Name)
    $index = 0
    foreach ($entry in $media) {
        $index++
        $extension = [System.IO.Path]::GetExtension($entry.Name).ToLowerInvariant()
        $fileName = "{0}-image-{1:D3}{2}" -f $Source['assetPrefix'], $index, $extension
        $dest = Join-Path $OutputDirectory $fileName
        $input = $entry.Open()
        $output = [System.IO.File]::Create($dest)
        try { $input.CopyTo($output) } finally { $output.Dispose(); $input.Dispose() }
        $width = $null; $height = $null
        try {
            $image = [System.Drawing.Image]::FromFile($dest)
            try { $width = $image.Width; $height = $image.Height } finally { $image.Dispose() }
        } catch { }
        $hash = (Get-FileHash -LiteralPath $dest -Algorithm SHA256).Hash.ToLowerInvariant()
        $mime = switch ($extension) {
            '.png' { 'image/png' }
            '.jpg' { 'image/jpeg' }
            '.jpeg' { 'image/jpeg' }
            '.gif' { 'image/gif' }
            '.svg' { 'image/svg+xml' }
            '.emf' { 'image/emf' }
            '.wmf' { 'image/wmf' }
            default { 'application/octet-stream' }
        }
        $asset = [ordered]@{
            id = ("{0}-asset-{1:D3}" -f $Source['id'], $index)
            documentId = $Source['id']
            originalPart = $entry.FullName
            originalFileName = $entry.Name
            fileName = $fileName
            publicPath = "/source-assets/$fileName"
            mimeType = $mime
            bytes = $entry.Length
            widthPx = $width
            heightPx = $height
            sha256 = $hash
        }
        $assets.Add($asset)
        $map[$entry.FullName] = $asset
    }
    return [ordered]@{ assets = @($assets); map = $map }
}

function Set-CaptionsAndDerivedContent {
    param([System.Collections.IDictionary]$Document)
    $blocks = @($Document['blocks'])
    $tableById = @{}
    foreach ($table in $Document['tables']) { $tableById[$table['id']] = $table }
    for ($i = 0; $i -lt $blocks.Count; $i++) {
        $block = $blocks[$i]
        if ($block['type'] -eq 'table') {
            $caption = $null
            for ($j = $i - 1; $j -ge [Math]::Max(0, $i - 3); $j--) {
                if ($blocks[$j]['type'] -eq 'paragraph' -and -not [string]::IsNullOrWhiteSpace($blocks[$j]['paragraph']['text'])) { $caption = $blocks[$j]['paragraph']['text']; break }
            }
            if ($caption -match '^(Quadro|Tabela)\s+(\d+)\s*[-–—]\s*(.+)$') {
                $table = $tableById[$block['tableId']]
                $table['caption'] = $caption
                $table['labelType'] = $Matches[1]
                $table['labelNumber'] = [int]$Matches[2]
                $table['title'] = $Matches[3].Trim()
                $block['caption'] = $caption
            }
        }
    }
    $figures = [System.Collections.Generic.List[object]]::new()
    for ($i = 0; $i -lt $blocks.Count; $i++) {
        $block = $blocks[$i]
        if ($block['type'] -ne 'paragraph' -or @($block['paragraph']['images']).Count -eq 0) { continue }
        $caption = $null
        foreach ($j in @(($i + 1), ($i - 1), ($i + 2), ($i - 2))) {
            if ($j -ge 0 -and $j -lt $blocks.Count -and $blocks[$j]['type'] -eq 'paragraph') {
                $candidate = $blocks[$j]['paragraph']['text']
                if ($candidate -match '^Figura\s+\d+\s*[-–—]') { $caption = $candidate; break }
            }
        }
        if ($caption -match '^Figura\s+(\d+)\s*[-–—]\s*(.+)$') {
            $block['figureCaption'] = $caption
            foreach ($image in $block['paragraph']['images']) {
                $figures.Add([ordered]@{
                    id = ("{0}-figure-{1:D3}" -f $Document['id'], ([int]$Matches[1]))
                    number = [int]$Matches[1]
                    title = $Matches[2].Trim()
                    caption = $caption
                    blockId = $block['id']
                    assetId = $image['assetId']
                    publicPath = $image['publicPath']
                    altText = $image['altText']
                })
            }
        }
    }
    $Document['figures'] = @($figures)
    if ($Document['id'] -eq 'fluxogramas') {
        $flowcharts = [System.Collections.Generic.List[object]]::new()
        $currentNumber = $null; $currentTitle = $null; $variant = $null
        foreach ($block in $blocks) {
            if ($block['type'] -ne 'paragraph') { continue }
            $text = $block['paragraph']['text'].Trim()
            if ($text -match '^Fluxograma\s+(\d+)\s*[-–—]\s*(.+)$') {
                $currentNumber = [int]$Matches[1]
                $currentTitle = $Matches[2].Trim()
                $variant = $null
                continue
            }
            if ($text -match '^FLUXOGRAMA\s+(ORIGINAL|PROPOSTO SIMPLIFICADO|PROPOSTO COMPLETO)') {
                $variant = switch -Regex ($Matches[1]) { '^ORIGINAL$' { 'original' } 'SIMPLIFICADO' { 'simplificado' } 'COMPLETO' { 'completo' } }
                continue
            }
            if ($currentNumber -and $variant -and @($block['paragraph']['images']).Count -gt 0) {
                $image = @($block['paragraph']['images'])[0]
                $flowcharts.Add([ordered]@{
                    id = ("flowchart-{0:D2}-{1}" -f $currentNumber, $variant)
                    number = $currentNumber
                    title = $currentTitle
                    variant = $variant
                    blockId = $block['id']
                    assetId = $image['assetId']
                    publicPath = $image['publicPath']
                    widthPx = (@($Document['assets'] | Where-Object { $_['id'] -eq $image['assetId'] })[0])['widthPx']
                    heightPx = (@($Document['assets'] | Where-Object { $_['id'] -eq $image['assetId'] })[0])['heightPx']
                })
                $variant = $null
            }
        }
        $Document['flowcharts'] = @($flowcharts)
    }
}

function Set-Sections {
    param([System.Collections.IDictionary]$Document)
    $sections = [System.Collections.Generic.List[object]]::new()
    $stack = [System.Collections.Generic.List[object]]::new()
    foreach ($block in $Document['blocks']) {
        if ($block['navigationOnly']) { continue }
        $isHeading = $block['type'] -eq 'paragraph' -and $block['paragraph']['headingLevel'] -and -not [string]::IsNullOrWhiteSpace($block['paragraph']['text'])
        if ($isHeading) {
            $level = [int]$block['paragraph']['headingLevel']
            while ($stack.Count -gt 0 -and [int]$stack[$stack.Count - 1]['level'] -ge $level) { $stack.RemoveAt($stack.Count - 1) }
            $parentId = if ($stack.Count -gt 0) { $stack[$stack.Count - 1]['id'] } else { $null }
            $text = $block['paragraph']['text'].Trim()
            $number = $null; $title = $text
            if ($text -match '^([0-9]+(?:\.[0-9]+)*)\s+(.+)$') {
                $number = $Matches[1]; $title = $Matches[2]
            } elseif ($text -match '^(Anexo\s+[A-Z])\s*[-–—]\s*(.+)$') {
                $number = $Matches[1]; $title = $Matches[2]
            } elseif ($text -match '^Referências\b') {
                $number = 'Referências'
            }
            $section = [ordered]@{
                id = ("{0}-section-{1:D3}" -f $Document['id'], ($sections.Count + 1))
                level = $level
                number = $number
                title = $title
                fullTitle = $text
                headingBlockId = $block['id']
                parentId = $parentId
                blockIds = [System.Collections.Generic.List[string]]::new()
            }
            $sections.Add($section)
            $stack.Add($section)
            $block['sectionId'] = $section['id']
        } elseif ($stack.Count -gt 0) {
            $section = $stack[$stack.Count - 1]
            $section['blockIds'].Add([string]$block['id'])
            $block['sectionId'] = $section['id']
        }
    }
    foreach ($section in $sections) { $section['blockIds'] = @($section['blockIds']) }
    $Document['sections'] = @($sections)
}

function Extract-Document {
    param([System.Collections.IDictionary]$Source)
    $sourceItem = Get-Item -LiteralPath $Source['path']
    $zip = [System.IO.Compression.ZipFile]::OpenRead($Source['path'])
    try {
        $documentXml = Read-ZipXml -Zip $zip -Name 'word/document.xml'
        $ns = New-NamespaceManager -Xml $documentXml
        $relationships = Get-RelationshipMap -Zip $zip -PartName 'word/document.xml'
        $styles = Get-Styles -Zip $zip
        $numbering = Get-Numbering -Zip $zip
        $assetExport = Export-Assets -Zip $zip -Source $Source -OutputDirectory $AssetDir
        $blocks = [System.Collections.Generic.List[object]]::new()
        $tables = [System.Collections.Generic.List[object]]::new()
        $bodyParagraphCount = 0; $tableParagraphCount = 0; $tableIndex = 0; $blockIndex = 0; $navigation = $false
        $body = $documentXml.SelectSingleNode('//w:body', $ns)
        foreach ($node in $body.ChildNodes) {
            if ($node.LocalName -eq 'sectPr') { continue }
            $blockIndex++
            $blockId = "{0}-block-{1:D4}" -f $Source['id'], $blockIndex
            if ($node.LocalName -eq 'p') {
                $bodyParagraphCount++
                $paragraph = Get-ParagraphObject -Paragraph $node -Ns $ns -Styles $styles -Numbers $numbering['numbers'] -Relationships $relationships -AssetByPart $assetExport['map'] -Id ("{0}-paragraph-{1:D4}" -f $Source['id'], $bodyParagraphCount)
                $trim = $paragraph['text'].Trim()
                if ($Source['id'] -eq 'pop' -and $trim -eq 'Sumário navegável') { $navigation = $true }
                if ($Source['id'] -eq 'pop' -and $navigation -and $paragraph['headingLevel'] -eq 1 -and $trim -match '^1\s+') { $navigation = $false }
                $blocks.Add([ordered]@{
                    id = $blockId
                    sourceIndex = $blockIndex
                    type = 'paragraph'
                    navigationOnly = $navigation
                    sectionId = $null
                    paragraph = $paragraph
                })
            } elseif ($node.LocalName -eq 'tbl') {
                $tableIndex++
                $tableId = "{0}-table-{1:D3}" -f $Source['id'], $tableIndex
                $table = Get-TableObject -Table $node -Ns $ns -Styles $styles -Numbers $numbering['numbers'] -Relationships $relationships -AssetByPart $assetExport['map'] -Id $tableId -TableIndex $tableIndex -DocumentId $Source['id']
                $table['navigationOnly'] = $navigation
                $tableParagraphCount += $table['paragraphCount']
                $tables.Add($table)
                $blocks.Add([ordered]@{
                    id = $blockId
                    sourceIndex = $blockIndex
                    type = 'table'
                    navigationOnly = $navigation
                    sectionId = $null
                    tableId = $tableId
                    caption = $null
                })
            }
        }
        $allParagraphNodes = $documentXml.SelectNodes('//w:p', $ns).Count
        $core = Get-Properties -Zip $zip -Part 'docProps/core.xml'
        $app = Get-Properties -Zip $zip -Part 'docProps/app.xml'
        $custom = Get-Properties -Zip $zip -Part 'docProps/custom.xml'
        $allText = (@($documentXml.SelectNodes('//w:t', $ns) | ForEach-Object { $_.InnerText }) -join ' ')
        $operational = [ordered]@{}
        if ($Source['id'] -eq 'pop') {
            if ($allText -match 'POP-DLE-HID-001') { $operational['documentCode'] = 'POP-DLE-HID-001' }
            if ($allText -match 'Versão:\s*([0-9.]+)') { $operational['version'] = $Matches[1] }
            if ($allText -match 'Data:\s*([^\r\n]+?)Natureza:') { $operational['dateLabel'] = $Matches[1].Trim() }
            $operational['jurisdiction'] = 'Estado do Paraná'
            $operational['organization'] = 'Instituto Água e Terra - IAT'
        }
        $doc = [ordered]@{
            schemaVersion = '1.0.0'
            generatedAt = [DateTime]::UtcNow.ToString('o')
            id = $Source['id']
            kind = $Source['kind']
            title = $Source['title']
            source = [ordered]@{
                fileName = $sourceItem.Name
                fullPath = $sourceItem.FullName
                bytes = $sourceItem.Length
                lastModifiedUtc = $sourceItem.LastWriteTimeUtc.ToString('o')
                sha256 = (Get-FileHash -LiteralPath $sourceItem.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
            }
            metadata = [ordered]@{
                core = $core
                application = $app
                custom = $custom
                operational = $operational
                supplementalParts = Get-SupplementalParts -Zip $zip
            }
            assets = $assetExport['assets']
            blocks = @($blocks)
            sections = @()
            tables = @($tables)
            figures = @()
            flowcharts = @()
            learningContent = [ordered]@{
                includedBlockIds = @($blocks | Where-Object { -not $_['navigationOnly'] } | ForEach-Object { $_['id'] })
                excludedNavigationBlockIds = @($blocks | Where-Object { $_['navigationOnly'] } | ForEach-Object { $_['id'] })
            }
            stats = [ordered]@{
                bodyBlockCount = $blocks.Count
                bodyParagraphCount = $bodyParagraphCount
                tableParagraphCount = $tableParagraphCount
                allDocumentParagraphNodes = $allParagraphNodes
                tableCount = $tables.Count
                imageAssetCount = @($assetExport['assets']).Count
                imageOccurrenceCount = $documentXml.SelectNodes('//a:blip', $ns).Count
                headingCount = @($blocks | Where-Object { $_['type'] -eq 'paragraph' -and $_['paragraph']['headingLevel'] }).Count
                listItemCount = 0
                textNodeCount = $documentXml.SelectNodes('//w:t', $ns).Count
                fieldInstructionCount = $documentXml.SelectNodes('//w:instrText', $ns).Count
                insertionCount = $documentXml.SelectNodes('//w:ins', $ns).Count
                deletionCount = $documentXml.SelectNodes('//w:del', $ns).Count
            }
        }
        Set-CaptionsAndDerivedContent -Document $doc
        Set-Sections -Document $doc
        $doc['stats']['figureCount'] = @($doc['figures']).Count
        $doc['stats']['flowchartCount'] = @($doc['flowcharts']).Count
        $doc['stats']['navigationOnlyBlockCount'] = @($doc['learningContent']['excludedNavigationBlockIds']).Count
        $doc['stats']['substantiveBlockCount'] = @($doc['learningContent']['includedBlockIds']).Count
        $listItems = @($doc['blocks'] | Where-Object { $_['type'] -eq 'paragraph' -and $null -ne $_['paragraph']['list'] }).Count
        foreach ($table in $doc['tables']) {
            foreach ($row in $table['rows']) {
                foreach ($cell in $row['cells']) { $listItems += @($cell['paragraphs'] | Where-Object { $null -ne $_['list'] }).Count }
            }
        }
        $doc['stats']['listItemCount'] = $listItems
        return $doc
    } finally {
        $zip.Dispose()
    }
}

function Write-JsonUtf8 {
    param([object]$Value, [string]$Path)
    $json = $Value | ConvertTo-Json -Depth 100 -Compress
    [System.IO.File]::WriteAllText($Path, $json, [System.Text.UTF8Encoding]::new($false))
}

function Test-TextFidelity {
    param(
        [string]$SourcePath,
        [System.Collections.IDictionary]$Document
    )
    $zip = [System.IO.Compression.ZipFile]::OpenRead($SourcePath)
    try {
        $xml = Read-ZipXml -Zip $zip -Name 'word/document.xml'
        $ns = New-NamespaceManager -Xml $xml
        $sourceParagraphs = @($xml.SelectNodes('//w:body//w:p', $ns) | ForEach-Object {
            (@($_.SelectNodes('.//w:t', $ns) | ForEach-Object { $_.InnerText }) -join '')
        })
    } finally { $zip.Dispose() }
    $tableById = @{}
    foreach ($table in $Document['tables']) { $tableById[$table['id']] = $table }
    $extractedParagraphs = [System.Collections.Generic.List[string]]::new()
    foreach ($block in $Document['blocks']) {
        if ($block['type'] -eq 'paragraph') {
            $extractedParagraphs.Add([string]$block['paragraph']['text'])
        } elseif ($block['type'] -eq 'table') {
            foreach ($row in $tableById[$block['tableId']]['rows']) {
                foreach ($cell in $row['cells']) {
                    foreach ($paragraph in $cell['paragraphs']) { $extractedParagraphs.Add([string]$paragraph['text']) }
                }
            }
        }
    }
    $mismatches = 0; $firstMismatch = $null
    $commonCount = [Math]::Min($sourceParagraphs.Count, $extractedParagraphs.Count)
    for ($i = 0; $i -lt $commonCount; $i++) {
        $sourceText = [regex]::Replace($sourceParagraphs[$i], '[\s\u00AD\u2011]', '')
        $extractedText = [regex]::Replace($extractedParagraphs[$i], '[\s\u00AD\u2011]', '')
        if ($sourceText -cne $extractedText) {
            $mismatches++
            if ($null -eq $firstMismatch) { $firstMismatch = $i }
        }
    }
    return [ordered]@{
        sourceParagraphCount = $sourceParagraphs.Count
        extractedParagraphCount = $extractedParagraphs.Count
        normalizedTextMismatchCount = $mismatches
        firstMismatchIndex = $firstMismatch
        pass = ($sourceParagraphs.Count -eq $extractedParagraphs.Count -and $mismatches -eq 0)
    }
}

$documents = [System.Collections.Generic.List[object]]::new()
$allAssets = [System.Collections.Generic.List[object]]::new()
foreach ($source in $Sources) {
    $document = Extract-Document -Source $source
    $documents.Add($document)
    foreach ($asset in $document['assets']) { $allAssets.Add($asset) }
    Write-JsonUtf8 -Value $document -Path (Join-Path $DataDir $source['output'])
}

$assetManifest = [ordered]@{
    schemaVersion = '1.0.0'
    generatedAt = [DateTime]::UtcNow.ToString('o')
    assetCount = $allAssets.Count
    documents = @($documents | ForEach-Object { [ordered]@{ id = $_['id']; sourceFile = $_['source']['fileName']; assetCount = @($_['assets']).Count } })
    assets = @($allAssets)
}
Write-JsonUtf8 -Value $assetManifest -Path (Join-Path $AssetDir 'asset-manifest.json')

$catalog = [ordered]@{
    schemaVersion = '1.0.0'
    generatedAt = [DateTime]::UtcNow.ToString('o')
    documents = @(
        [ordered]@{ id = 'pop'; title = $documents[0]['title']; dataPath = './pop-content.json'; kind = $documents[0]['kind']; sections = @($documents[0]['sections']).Count; tables = @($documents[0]['tables']).Count; figures = @($documents[0]['figures']).Count },
        [ordered]@{ id = 'fluxogramas'; title = $documents[1]['title']; dataPath = './flowcharts-content.json'; kind = $documents[1]['kind']; flowcharts = @($documents[1]['flowcharts']).Count; variants = @('original', 'simplificado', 'completo') }
    )
    assetsManifestPath = '/source-assets/asset-manifest.json'
    suggestedLearningModules = @(
        [ordered]@{ id = 'fundamentos'; sectionNumbers = @('1','2','3','4','5','6','7'); title = 'Fundamentos, normas e método de análise' },
        [ordered]@{ id = 'enquadramento'; sectionNumbers = @('8'); title = 'Enquadramento por tipologia, modalidade e estudo' },
        [ordered]@{ id = 'modalidades'; sectionNumbers = @('9','10','11','12','13','14','15','16','17'); title = 'Modalidades, fases e situações especiais' },
        [ordered]@{ id = 'documentos-pacuera'; sectionNumbers = @('18'); title = 'Documentos técnicos, estudos ambientais e PACUERA' },
        [ordered]@{ id = 'analise-tecnica'; sectionNumbers = @('19','20','21','22','23','24','25'); title = 'Análise técnica, vistoria, suficiência e condicionantes' },
        [ordered]@{ id = 'qualidade'; sectionNumbers = @('26','27','Anexo A','Anexo B','Anexo C','Anexo D','Anexo E','Referências'); title = 'Produtos técnicos, qualidade, rastreabilidade e anexos' }
    )
}
Write-JsonUtf8 -Value $catalog -Path (Join-Path $DataDir 'content-catalog.json')

$pop = $documents[0]
$flows = $documents[1]
$popFidelity = Test-TextFidelity -SourcePath $Sources[0]['path'] -Document $pop
$flowFidelity = Test-TextFidelity -SourcePath $Sources[1]['path'] -Document $flows
$checks = @(
    [ordered]@{ id = 'pop-table-count'; expected = 61; actual = @($pop['tables']).Count; pass = (@($pop['tables']).Count -eq 61) },
    [ordered]@{ id = 'pop-table-labels'; expected = '46 quadros + 15 tabelas'; actual = ('{0} quadros + {1} tabelas' -f @($pop['tables'] | Where-Object { $_['labelType'] -eq 'Quadro' }).Count, @($pop['tables'] | Where-Object { $_['labelType'] -eq 'Tabela' }).Count); pass = (@($pop['tables'] | Where-Object { $_['labelType'] -eq 'Quadro' }).Count -eq 46 -and @($pop['tables'] | Where-Object { $_['labelType'] -eq 'Tabela' }).Count -eq 15) },
    [ordered]@{ id = 'pop-navigation-block-count'; expected = 74; actual = @($pop['learningContent']['excludedNavigationBlockIds']).Count; pass = (@($pop['learningContent']['excludedNavigationBlockIds']).Count -eq 74) },
    [ordered]@{ id = 'pop-navigation-table-count'; expected = 2; actual = @($pop['tables'] | Where-Object { $_['navigationOnly'] }).Count; pass = (@($pop['tables'] | Where-Object { $_['navigationOnly'] }).Count -eq 2) },
    [ordered]@{ id = 'pop-image-count'; expected = 12; actual = @($pop['assets']).Count; pass = (@($pop['assets']).Count -eq 12) },
    [ordered]@{ id = 'flow-image-count'; expected = 21; actual = @($flows['assets']).Count; pass = (@($flows['assets']).Count -eq 21) },
    [ordered]@{ id = 'flowchart-variant-count'; expected = 21; actual = @($flows['flowcharts']).Count; pass = (@($flows['flowcharts']).Count -eq 21) },
    [ordered]@{ id = 'pop-paragraph-node-count'; expected = 2690; actual = $pop['stats']['allDocumentParagraphNodes']; pass = ($pop['stats']['allDocumentParagraphNodes'] -eq 2690) },
    [ordered]@{ id = 'flow-paragraph-node-count'; expected = 87; actual = $flows['stats']['allDocumentParagraphNodes']; pass = ($flows['stats']['allDocumentParagraphNodes'] -eq 87) },
    [ordered]@{ id = 'pop-text-fidelity'; expected = '0 normalized paragraph mismatches'; actual = ("{0} normalized paragraph mismatches" -f $popFidelity['normalizedTextMismatchCount']); pass = $popFidelity['pass']; details = $popFidelity },
    [ordered]@{ id = 'flow-text-fidelity'; expected = '0 normalized paragraph mismatches'; actual = ("{0} normalized paragraph mismatches" -f $flowFidelity['normalizedTextMismatchCount']); pass = $flowFidelity['pass']; details = $flowFidelity },
    [ordered]@{ id = 'asset-manifest-count'; expected = 33; actual = $allAssets.Count; pass = ($allAssets.Count -eq 33) },
    [ordered]@{ id = 'all-assets-exist'; expected = $true; actual = -not [bool](@($allAssets | Where-Object { -not (Test-Path -LiteralPath (Join-Path $AssetDir $_['fileName'])) }).Count); pass = -not [bool](@($allAssets | Where-Object { -not (Test-Path -LiteralPath (Join-Path $AssetDir $_['fileName'])) }).Count) },
    [ordered]@{ id = 'all-assets-decodable'; expected = $true; actual = -not [bool](@($allAssets | Where-Object { $null -eq $_['widthPx'] -or $null -eq $_['heightPx'] }).Count); pass = -not [bool](@($allAssets | Where-Object { $null -eq $_['widthPx'] -or $null -eq $_['heightPx'] }).Count) },
    [ordered]@{ id = 'all-tables-have-rows'; expected = $true; actual = -not [bool](@($pop['tables'] | Where-Object { $_['rowCount'] -lt 1 }).Count); pass = -not [bool](@($pop['tables'] | Where-Object { $_['rowCount'] -lt 1 }).Count) },
    [ordered]@{ id = 'tracked-changes-absent-pop'; expected = 0; actual = ($pop['stats']['insertionCount'] + $pop['stats']['deletionCount']); pass = (($pop['stats']['insertionCount'] + $pop['stats']['deletionCount']) -eq 0) }
)
$validation = [ordered]@{
    schemaVersion = '1.0.0'
    generatedAt = [DateTime]::UtcNow.ToString('o')
    passed = -not [bool](@($checks | Where-Object { -not $_['pass'] }).Count)
    checks = $checks
    summary = [ordered]@{
        pop = $pop['stats']
        fluxogramas = $flows['stats']
        totalAssets = $allAssets.Count
        notes = @(
            'Todos os 61 elementos w:tbl do POP foram preservados, inclusive os dois quadros navegacionais, marcados como navigationOnly para não serem exibidos como conteúdo didático redundante.',
            'Os blocos do sumário e dos índices foram mantidos para rastreabilidade, mas excluídos de learningContent.includedBlockIds.',
            'As 21 imagens do documento de fluxogramas foram agrupadas em sete temas com três variantes cada.'
        )
    }
}
Write-JsonUtf8 -Value $validation -Path (Join-Path $DataDir 'extraction-validation.json')

if (-not $validation['passed']) { throw 'A validação da extração falhou. Consulte extraction-validation.json.' }

$validation | ConvertTo-Json -Depth 10
