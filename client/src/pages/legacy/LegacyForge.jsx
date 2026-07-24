import { useMemo, useState } from "react";
import CommandNav from "../../components/CommandNav";
import {
  DEFAULT_MISSION_SELECTION,
  ENERGY_OPTIONS,
  LEGACY_DIVISIONS,
  OUTCOME_OPTIONS,
  SYSTEM_STATUS,
  TIME_OPTIONS,
  generateLegacyMission,
  getDivisionById,
  isPresentationMode,
  toggleMissionStep
} from "./legacyForgeModel";
import "./legacyForge.css";

function StatusPill({ children, tone }) {
  return <span className={`legacy-status-pill legacy-status-${tone}`}>{children}</span>;
}

function DivisionCard({ division, selected, onSelect, interactive = true }) {
  const content = (
    <>
      <div className="legacy-division-heading">
        <span>{division.code}</span>
        <StatusPill tone={division.statuses[0].tone}>{division.statuses[0].label}</StatusPill>
      </div>
      <h3>{division.name}</h3>
      <p>{division.purpose}</p>
      <ul>
        {division.initiatives.slice(0, 3).map((initiative) => <li key={initiative}>{initiative}</li>)}
      </ul>
    </>
  );

  if (!interactive) {
    return <article className="legacy-division-card">{content}</article>;
  }

  return (
    <button
      className={`legacy-division-card legacy-division-button ${selected ? "is-selected" : ""}`}
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect(division.id)}
    >
      {content}
      <span className="legacy-card-action">{selected ? "Division selected" : "Open division"}</span>
    </button>
  );
}

function MissionForge() {
  const [selection, setSelection] = useState(DEFAULT_MISSION_SELECTION);
  const [mission, setMission] = useState(null);
  const completed = mission?.steps.filter((step) => step.complete).length || 0;

  const updateSelection = (field, value) => setSelection((current) => ({ ...current, [field]: value }));
  const reset = () => {
    setSelection(DEFAULT_MISSION_SELECTION);
    setMission(null);
  };

  return (
    <section className="legacy-panel legacy-mission-forge" aria-labelledby="mission-forge-title">
      <div className="legacy-section-heading">
        <div>
          <span className="legacy-eyebrow">Local mission-planning preview</span>
          <h2 id="mission-forge-title">Mission Forge</h2>
        </div>
        <StatusPill tone="operational">Local rules only</StatusPill>
      </div>
      <p className="legacy-section-intro">Shape one realistic three-step mission without login, storage, an API call, or simulated AI inference.</p>
      <form
        className="legacy-forge-form"
        onSubmit={(event) => {
          event.preventDefault();
          setMission(generateLegacyMission(selection));
        }}
      >
        <label>
          Division
          <select value={selection.divisionId} onChange={(event) => updateSelection("divisionId", event.target.value)}>
            {LEGACY_DIVISIONS.map((division) => <option value={division.id} key={division.id}>{division.name}</option>)}
          </select>
        </label>
        <label>
          Available time
          <select value={selection.time} onChange={(event) => updateSelection("time", event.target.value)}>
            {TIME_OPTIONS.map((option) => <option value={option} key={option}>{option}</option>)}
          </select>
        </label>
        <label>
          Energy level
          <select value={selection.energy} onChange={(event) => updateSelection("energy", event.target.value)}>
            {ENERGY_OPTIONS.map((option) => <option value={option} key={option}>{option}</option>)}
          </select>
        </label>
        <label>
          Intended outcome
          <select value={selection.outcome} onChange={(event) => updateSelection("outcome", event.target.value)}>
            {OUTCOME_OPTIONS.map((option) => <option value={option} key={option}>{option}</option>)}
          </select>
        </label>
        <div className="legacy-form-actions">
          <button className="legacy-button legacy-button-primary" type="submit">Forge mission</button>
          <button className="legacy-button" type="button" onClick={reset}>Reset</button>
        </div>
      </form>

      {mission ? (
        <article className="legacy-mission-result" aria-live="polite">
          <div className="legacy-mission-result-head">
            <div>
              <span className="legacy-eyebrow">Three-step mission</span>
              <h3>{mission.title}</h3>
            </div>
            <StatusPill tone={completed === 3 ? "operational" : "planned"}>{completed}/3 complete</StatusPill>
          </div>
          <p>{mission.brief}</p>
          <div className="legacy-mission-steps">
            {mission.steps.map((step, index) => (
              <label className={step.complete ? "is-complete" : ""} key={step.id}>
                <input
                  type="checkbox"
                  checked={step.complete}
                  onChange={() => setMission((current) => toggleMissionStep(current, step.id))}
                />
                <span>{index + 1}</span>
                <strong>{step.label}</strong>
              </label>
            ))}
          </div>
          <small>{mission.disclosure}</small>
        </article>
      ) : null}
    </section>
  );
}

export default function LegacyForge() {
  const [selectedDivisionId, setSelectedDivisionId] = useState(LEGACY_DIVISIONS[0].id);
  const [presentation, setPresentation] = useState(() => typeof window !== "undefined" && isPresentationMode(window.location.search));
  const selectedDivision = useMemo(() => getDivisionById(selectedDivisionId), [selectedDivisionId]);

  const enablePresentation = () => {
    setPresentation(true);
    if (typeof window !== "undefined") {
      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.set("presentation", "1");
      window.history.replaceState({}, "", nextUrl);
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  };

  return (
    <div className={`legacy-forge-page ${presentation ? "is-presentation" : ""}`}>
      {!presentation ? (
        <div className="legacy-command-nav-wrap">
          <CommandNav current="legacy-forge" />
        </div>
      ) : null}

      <main className="legacy-forge-shell">
        <header className="legacy-hero">
          <div className="legacy-hero-copy">
            <span className="legacy-eyebrow">ARCHAIOS public preview · Legacy Forge</span>
            <h1>A Founder-and-AI Command System for Building and Preserving a Living Legacy</h1>
            <p>Human vision establishes the mission. Artificial intelligence organizes the operation. Documented execution secures the legacy.</p>
            {!presentation ? (
              <button className="legacy-button legacy-button-primary legacy-presentation-toggle" type="button" onClick={enablePresentation}>
                Enter presentation mode
              </button>
            ) : null}
          </div>
          <div className="legacy-collaboration-grid" aria-label="ARCHAIOS Core Command collaborators">
            <article>
              <span>Human command</span>
              <h2>Quandrix Lee Blackburn</h2>
              <p>Founder, visionary, designer, creator, veteran communicator, researcher, and Saint Black.</p>
            </article>
            <article>
              <span>Continuity command</span>
              <h2>ARCHAIOS AI</h2>
              <p>Strategic assistant, technical partner, archivist, mission planner, and continuity system.</p>
            </article>
          </div>
        </header>

        <section className="legacy-divisions" aria-labelledby="legacy-divisions-title">
          <div className="legacy-section-heading">
            <div>
              <span className="legacy-eyebrow">Four legacy divisions</span>
              <h2 id="legacy-divisions-title">One command system. Four enduring fronts.</h2>
            </div>
            <span className="legacy-section-note">Public-safe preview · active development</span>
          </div>
          <div className="legacy-division-grid">
            {LEGACY_DIVISIONS.map((division) => (
              <DivisionCard
                division={division}
                selected={selectedDivisionId === division.id}
                onSelect={setSelectedDivisionId}
                interactive={!presentation}
                key={division.id}
              />
            ))}
          </div>
          {!presentation ? (
            <article className="legacy-selected-division" aria-live="polite">
              <div>
                <span className="legacy-eyebrow">Selected division · {selectedDivision.code}</span>
                <h3>{selectedDivision.name}</h3>
                <p>{selectedDivision.purpose}</p>
              </div>
              <div className="legacy-status-stack">
                {selectedDivision.statuses.map((status) => <StatusPill tone={status.tone} key={status.label}>{status.label}</StatusPill>)}
              </div>
              <ul>
                {selectedDivision.initiatives.map((initiative) => <li key={initiative}>{initiative}</li>)}
              </ul>
            </article>
          ) : null}
        </section>

        <div className="legacy-preservation-grid">
          <section className="legacy-panel legacy-black-vault" aria-labelledby="black-vault-title">
            <span className="legacy-vault-mark" aria-hidden="true">BV</span>
            <div>
              <span className="legacy-eyebrow">Future permanent archive</span>
              <h2 id="black-vault-title">The Black Vault</h2>
              <p>Missions, milestones, architecture decisions, public releases, research versions, creative assets, founder records, and future institutional continuity.</p>
              <strong>Private archive connection pending secure authenticated infrastructure.</strong>
            </div>
          </section>

          <blockquote className="legacy-founder-statement">
            <p>“I am not only building projects. I am building the system that will preserve them.”</p>
            <footer>
              <strong>Quandrix Lee Blackburn</strong>
              <span>Colonel Quandrix · Saint Black · Founder of the ARCHAIOS ecosystem</span>
            </footer>
          </blockquote>
        </div>

        {!presentation ? <MissionForge /> : null}

        {!presentation ? (
          <section className="legacy-panel legacy-system-status" aria-labelledby="legacy-status-title">
            <div className="legacy-section-heading">
              <div>
                <span className="legacy-eyebrow">Current system status</span>
                <h2 id="legacy-status-title">Honest operational posture</h2>
              </div>
              <StatusPill tone="restoration">Security gates enforced</StatusPill>
            </div>
            <div className="legacy-system-status-grid">
              <article>
                <h3>Operational</h3>
                <ul>{SYSTEM_STATUS.operational.map((item) => <li key={item}>{item}</li>)}</ul>
              </article>
              <article>
                <h3>Restricted or in restoration</h3>
                <ul>{SYSTEM_STATUS.restricted.map((item) => <li key={item}>{item}</li>)}</ul>
              </article>
            </div>
          </section>
        ) : null}

        <footer className="legacy-page-footer">
          <span>Designed through the continuing collaboration between Quandrix Lee Blackburn and ARCHAIOS AI.</span>
          <span>Public preview · No private archive connection</span>
        </footer>
      </main>
    </div>
  );
}
