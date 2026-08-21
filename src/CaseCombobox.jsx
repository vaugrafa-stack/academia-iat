import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import './routeStyles.css';

function normalize(value = '') {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR');
}

function groupedOptions(scenarios, groups) {
  const byId = new Map(scenarios.map((scenario) => [scenario.id, scenario]));
  return groups
    .map((group) => ({
      ...group,
      options: group.ids.map((id) => byId.get(id)).filter(Boolean),
    }))
    .filter((group) => group.options.length);
}

export default function CaseCombobox({
  id,
  scenarios = [],
  groups = [],
  value,
  onChange,
  label = 'Escolha seu caso de base',
}) {
  const generatedId = useId();
  const inputId = id || `case-combobox-${generatedId}`;
  const listboxId = `${inputId}-listbox`;
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const grouped = useMemo(
    () => groupedOptions(scenarios, groups),
    [scenarios, groups],
  );
  const selected = scenarios.find((scenario) => scenario.id === value) || scenarios[0];
  const selectedText = selected
    ? `${selected.label} · ${selected.title}`
    : '';
  const normalizedQuery = normalize(query.trim());
  const filteredGroups = useMemo(() => grouped
    .map((group) => ({
      ...group,
      options: group.options.filter((scenario) => {
        if (!normalizedQuery) return true;
        return normalize(`${scenario.label} ${scenario.title} ${scenario.type}`)
          .includes(normalizedQuery);
      }),
    }))
    .filter((group) => group.options.length), [grouped, normalizedQuery]);
  const filtered = filteredGroups.flatMap((group) => group.options);
  const activeOptionId = open && filtered[activeIndex]
    ? `${listboxId}-option-${filtered[activeIndex].id}`
    : null;

  useEffect(() => {
    if (activeIndex >= filtered.length) setActiveIndex(Math.max(0, filtered.length - 1));
  }, [activeIndex, filtered.length]);

  useEffect(() => {
    if (!activeOptionId) return;
    document.getElementById(activeOptionId)?.scrollIntoView?.({
      block: 'nearest',
      inline: 'nearest',
    });
  }, [activeOptionId]);

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('click', closeOnOutsideClick);
    return () => document.removeEventListener('click', closeOnOutsideClick);
  }, []);

  const choose = (scenario) => {
    onChange(scenario.id);
    setOpen(false);
    setQuery('');
    setActiveIndex(0);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const openList = () => {
    setOpen(true);
    setQuery('');
    const selectedIndex = filtered.findIndex((scenario) => scenario.id === selected?.id);
    setActiveIndex(Math.max(0, selectedIndex));
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!open) openList();
      else setActiveIndex((index) => Math.min(filtered.length - 1, index + 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) openList();
      else setActiveIndex((index) => Math.max(0, index - 1));
    } else if (event.key === 'Enter' && open && filtered[activeIndex]) {
      event.preventDefault();
      choose(filtered[activeIndex]);
    } else if (event.key === 'Escape' && open) {
      event.preventDefault();
      setOpen(false);
      setQuery('');
    } else if (event.key === 'Tab') {
      setOpen(false);
      setQuery('');
    }
  };

  return (
    <div className="case-combobox" ref={rootRef}>
      <Search className="case-combobox-search" size={17} aria-hidden="true" />
      <input
        id={inputId}
        ref={inputRef}
        role="combobox"
        aria-label={label}
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-expanded={open}
        aria-activedescendant={activeOptionId || undefined}
        autoComplete="off"
        value={open ? query : selectedText}
        placeholder="Pesquise por nome, assunto ou tipologia"
        onFocus={() => {
          if (!open) openList();
        }}
        onClick={() => {
          if (!open) openList();
        }}
        onChange={(event) => {
          setOpen(true);
          setQuery(event.target.value);
          setActiveIndex(0);
        }}
        onKeyDown={handleKeyDown}
      />
      <button
        type="button"
        className="case-combobox-toggle"
        aria-label={open ? 'Fechar lista de casos' : 'Abrir lista de casos'}
        tabIndex={-1}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => {
          if (open) {
            setOpen(false);
            setQuery('');
          } else {
            openList();
            inputRef.current?.focus();
          }
        }}
      >
        <ChevronDown size={18} aria-hidden="true" />
      </button>

      {open && (
        <div id={listboxId} className="case-combobox-listbox" role="listbox">
          {filteredGroups.length ? filteredGroups.map((group) => (
            <div
              className="case-combobox-group"
              role="group"
              aria-label={`${group.titulo} · ${group.nivel}`}
              key={group.id}
            >
              <div className="case-combobox-group-label" aria-hidden="true">
                <strong>{group.titulo}</strong>
                <span>{group.nivel}</span>
              </div>
              {group.options.map((scenario) => {
                const index = filtered.findIndex((option) => option.id === scenario.id);
                const isSelected = scenario.id === selected?.id;
                const isActive = index === activeIndex;
                return (
                  <button
                    type="button"
                    id={`${listboxId}-option-${scenario.id}`}
                    key={scenario.id}
                    role="option"
                    aria-selected={isSelected}
                    className={`case-combobox-option${isActive ? ' active' : ''}${isSelected ? ' selected' : ''}`}
                    onMouseEnter={() => setActiveIndex(index)}
                    onPointerDown={(event) => {
                      event.stopPropagation();
                      if (event.pointerType === 'touch') return;
                      event.preventDefault();
                      choose(scenario);
                    }}
                    onClick={() => choose(scenario)}
                  >
                    <span>
                      <strong>{scenario.label}</strong>
                      <small>{scenario.title}</small>
                    </span>
                    <em>{scenario.type}</em>
                    {isSelected && <Check size={16} aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          )) : (
            <p className="case-combobox-empty" role="status">
              Nenhum caso corresponde à busca.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
