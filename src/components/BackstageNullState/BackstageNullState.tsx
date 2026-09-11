import { ReactNode, useRef } from 'react';
import { PdsAlert, PdsButton, PdsIcon, PdsLink } from '@pine-ds/react';
import { caretRight } from '@pine-ds/icons/icons';
import { BackstageContent } from '../../data/backstageContent';
import { BackstagePanel } from '../BackstagePanel/BackstagePanel';
import { usePdsAlertPadding } from '../../hooks/usePdsAlertPadding';
import './BackstageNullState.css';

interface BackstageNullStateProps {
  /** the page's copy — see src/data/backstageContent.ts */
  content: BackstageContent;
  /**
   * What runs inside the 520 x 600 panel — `App.tsx` passes `DemoSequence`. Omitted leaves
   * the panel on its bare teal ground; kept optional (rather than baked in here) because the
   * page's layout doesn't care what's inside the panel, only that something 520 x 600 is.
   */
  demo?: ReactNode;
}

/**
 * Backstage marketing null state — Figma page `↳ Null State [WIP🚧]`, frame
 * "Backstage null state" (`2363:43327`).
 *
 * Same template as the Expert Agents page, and the geometry is measured off the SHIPPED
 * EA page rather than re-derived, so the two are pixel-identical where they overlap:
 *
 *   hero          1004 × 600, 64px gap, children vertically centred
 *   copy column   420 wide, 32px stack gaps  (PdsBox gap="400")
 *   heading block 8px   (gap="100")
 *   values        24px between, 4px title→description  (gap="300" / gap="050")
 *   visual        520 × 600, radius 16
 *
 * That overlap is the open "is this a reusable pattern?" question (CLAUDE.md #8) showing
 * up in code. If the pattern is adopted, this CSS and ExpertAgentsNullState.css collapse
 * into one layout and each page keeps only its own content. Left duplicated for now
 * because extracting it means touching the EA route, which is handed off.
 */
export function BackstageNullState({ content, demo }: BackstageNullStateProps) {
  const alertRef = useRef<HTMLElement>(null);
  usePdsAlertPadding(alertRef);

  return (
    <div className="bs-null-state">
      <div className="bs-null-state__hero">
        <div className="bs-null-state__copy">
          <div className="bs-null-state__heading-block">
            <h1 className="bs-null-state__headline">{content.headline}</h1>
            {/* Allison's draft hides this; alternates A–E all restore it. Optional so a
                version can be transcribed exactly as the frame draws it. */}
            {content.body && <p className="bs-null-state__body">{content.body}</p>}
          </div>

          <div className="bs-null-state__values">
            {content.values.map((value) => (
              <div className="bs-null-state__value" key={value.heading}>
                <p className="bs-null-state__value-heading">{value.heading}</p>
                <p className="bs-null-state__value-description">{value.description}</p>
              </div>
            ))}
          </div>

          {/* CTA above the strip, so the last thing in the column is the price rather than
              the action — Sam, 8/19: price last in the visual and informational hierarchy. */}
          <div className="bs-null-state__actions">
            {/* Trailing caret in the DEFAULT slot, not `slot="end"`: Pine 3.26.4 computes an
                end-slotted icon's wrapper as empty on first render and never corrects it, so
                it lays out 0×0. Sized here because Pine styles a slotted icon for colour only. */}
            <PdsButton variant="primary">
              {content.cta}
              <PdsIcon className="bs-null-state__cta-icon" icon={caretRight} size="14px" />
            </PdsButton>
          </div>

          {/* Real pds-alert. `small` renders content and actions in one centred row and
              right-aligns the actions, which the default mode cannot produce; it also drops
              the `heading` prop, so both lines are slotted. `hideIcon` removes the sparkle. */}
          <PdsAlert ref={alertRef as never} className="bs-null-state__pricing" small hideIcon>
            <span className="bs-null-state__pricing-copy">
              <span className="bs-null-state__pricing-heading">{content.pricing.heading}</span>
              <span className="bs-null-state__pricing-body">{content.pricing.body}</span>
            </span>
            <PdsLink
              slot="actions"
              className="bs-null-state__pricing-link"
              href={content.pricing.linkHref}
              target="_blank"
              variant="plain"
            >
              {content.pricing.linkLabel}
            </PdsLink>
          </PdsAlert>
        </div>

        {/* No children = ground only; BackstagePanel skips its stage element when empty. */}
        <BackstagePanel>{demo}</BackstagePanel>
      </div>
    </div>
  );
}
