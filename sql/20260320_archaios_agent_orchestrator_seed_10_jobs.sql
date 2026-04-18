insert into public.agents (name, agent_type, description, status, enabled, schedule_cron, config)
values
  ('revenue_sentinel', 'revenue', 'Monitors revenue anomalies and recovery actions.', 'idle', true, '*/15 * * * *', '{"channel":"finance"}'::jsonb),
  ('brief_generator', 'briefing', 'Builds executive summaries and operational briefs.', 'idle', true, '0 * * * *', '{"audience":"leadership"}'::jsonb),
  ('system_monitor', 'ops', 'Tracks system health and incident posture.', 'idle', true, '*/30 * * * *', '{"channel":"ops"}'::jsonb),
  ('user_intelligence', 'research', 'Extracts user patterns and priority insights.', 'idle', true, '0 */2 * * *', '{"channel":"product"}'::jsonb),
  ('marketing_agent', 'growth', 'Prepares campaign and funnel optimizations.', 'idle', true, '15 */3 * * *', '{"channel":"marketing"}'::jsonb)
on conflict (name) do update
set agent_type = excluded.agent_type,
    description = excluded.description,
    enabled = excluded.enabled,
    schedule_cron = excluded.schedule_cron,
    config = excluded.config,
    updated_at = now();

with selected_agents as (
  select id, name
  from public.agents
  where name in (
    'revenue_sentinel',
    'brief_generator',
    'system_monitor',
    'user_intelligence',
    'marketing_agent'
  )
),
job_seed(agent_name, job_type, priority, trigger, input, context) as (
  values
    ('revenue_sentinel', 'daily_scan', 10, 'seed', '{"window":"24h"}'::jsonb, '{"source":"sample-run"}'::jsonb),
    ('revenue_sentinel', 'invoice_audit', 20, 'seed', '{"window":"7d"}'::jsonb, '{"source":"sample-run"}'::jsonb),
    ('brief_generator', 'exec_summary', 30, 'seed', '{"scope":"global"}'::jsonb, '{"source":"sample-run"}'::jsonb),
    ('brief_generator', 'board_brief', 40, 'seed', '{"scope":"board"}'::jsonb, '{"source":"sample-run"}'::jsonb),
    ('system_monitor', 'health_check', 15, 'seed', '{"region":"global"}'::jsonb, '{"source":"sample-run"}'::jsonb),
    ('system_monitor', 'incident_digest', 35, 'seed', '{"severity":"all"}'::jsonb, '{"source":"sample-run"}'::jsonb),
    ('user_intelligence', 'persona_refresh', 25, 'seed', '{"segment":"all"}'::jsonb, '{"source":"sample-run"}'::jsonb),
    ('user_intelligence', 'retention_scan', 45, 'seed', '{"window":"30d"}'::jsonb, '{"source":"sample-run"}'::jsonb),
    ('marketing_agent', 'campaign_review', 18, 'seed', '{"channel":"email"}'::jsonb, '{"source":"sample-run"}'::jsonb),
    ('marketing_agent', 'offer_test_queue', 28, 'seed', '{"channel":"landing-page"}'::jsonb, '{"source":"sample-run"}'::jsonb)
)
insert into public.agent_jobs (
  agent_id,
  agent_name,
  job_type,
  priority,
  trigger,
  scheduled_for,
  input,
  context
)
select
  a.id,
  s.agent_name,
  s.job_type,
  s.priority,
  s.trigger,
  now(),
  s.input,
  s.context
from job_seed s
join selected_agents a on a.name = s.agent_name;
