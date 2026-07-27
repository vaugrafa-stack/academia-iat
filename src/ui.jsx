// Componentes de apresentacao puros.
//
// Nao dependem de nada: recebem tudo por propriedade. E o modulo que
// faltava quando a primeira extracao levou o Suporte sem levar o
// PageHeader que ele usa, e o build passou mesmo assim.
import React from 'react';
import { BookOpen } from 'lucide-react';

export function PageHeader({title,subtitle,icon:Icon,kicker}){return <header className="page-header"><span><Icon/></span><div>{kicker&&<small className="ph-kicker">{kicker}</small>}<h1>{title}</h1><p>{subtitle}</p></div></header>}

export function Empty({text}){return <div className="empty-state"><BookOpen/><p>{text}</p></div>}
