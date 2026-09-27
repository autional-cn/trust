import { usePageTitle, usePageMeta } from '@autional-cn/shared';
import { STATUS_PAGE_URL } from '@autional-cn/shared';
import { useTranslation } from 'react-i18next';
import { useBreachNotifications } from '@/hooks/useTrustApi';
import { PageHeader, SectionCard, StatusBadge, EmptyState } from '@autional-cn/ui';
import { Shield, Clock, CheckCircle2, AlertTriangle, ExternalLink, Loader2 } from 'lucide-react';

const severityStyles: Record<string, string> = {
	low: 'bg-info/10 text-info',
	medium: 'bg-warning/10 text-warning',
	high: 'bg-danger/10 text-danger',
	critical: 'bg-danger/20 text-danger',
};

export default function IncidentsPage() {
	const { t } = useTranslation();
	usePageTitle(t('incidents.title'));
	usePageMeta('Autional 安全事件响应 — 历史安全事件时间线、响应流程与透明度承诺。');

	const {
		data: breachData,
		isLoading: breachLoading,
		isError: breachError,
	} = useBreachNotifications(1, 10);

	const dataBreachCount = breachData?.items?.length ?? 0;

	const staticIncidents = t('incidents.events', { returnObjects: true }) as unknown as Array<{
		id: string;
		date: string;
		title: string;
		severity: string;
		description: string;
		impact: string;
		resolution: string;
		status: string;
	}>;

	const processSteps = t('incidents.processSteps', { returnObjects: true }) as unknown as Array<{
		step: string;
		title: string;
		desc: string;
	}>;

	return (
		<div className="px-4 py-12 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-7xl">
				<PageHeader title={t('incidents.title')} subtitle={t('incidents.subtitle')} />

				{/* Stats */}
				<div className="mt-10 grid gap-4 sm:grid-cols-3">
					<SectionCard className="text-center" padding="md">
						<div className="text-3xl font-bold text-success">{dataBreachCount}</div>
						<div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
							{t('incidents.stats.breaches')}
						</div>
						{breachLoading && (
							<Loader2 className="mx-auto mt-2 h-4 w-4 animate-spin text-neutral-400" />
						)}
					</SectionCard>
					<SectionCard className="text-center" padding="md">
						<div className="text-3xl font-bold text-primary-600">&lt; 15min</div>
						<div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
							{t('incidents.stats.mttd')}
						</div>
					</SectionCard>
					<SectionCard className="text-center" padding="md">
						<div className="text-3xl font-bold text-primary-600">&lt; 1h</div>
						<div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
							{t('incidents.stats.mttr')}
						</div>
					</SectionCard>
				</div>

				{/* Dynamic Breach Notifications */}
				<div className="mt-12">
					<h2 className="text-xl font-bold text-neutral-900 dark:text-white">
						{t('incidents.breachNotifications')}
					</h2>
					<p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
						{t('incidents.breachDesc')}
					</p>

					{breachLoading && (
						<div className="mt-4 flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
							<Loader2 className="h-4 w-4 animate-spin" />
							{t('incidents.loadingBreaches')}
						</div>
					)}

					{breachError && (
						<div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-500 dark:border-neutral-800 dark:bg-slate-900/50">
							<AlertTriangle className="mb-1 inline h-4 w-4" />
							{t('incidents.breachesLoadFailed')}
						</div>
					)}

					{breachData && breachData.items.length > 0 && (
						<div className="mt-4 space-y-4">
							{breachData.items.map((breach) => {
								const sev = breach.severity?.toLowerCase();
								const variant =
									sev === 'critical'
										? 'danger'
										: sev === 'high'
											? 'warning'
											: sev === 'medium'
												? 'info'
												: 'neutral';
								return (
									<SectionCard key={breach.id} padding="lg">
										<div className="flex flex-wrap items-center gap-3">
											<span className="font-mono text-xs text-neutral-500 dark:text-neutral-400">
												BREACH-{breach.id.slice(0, 8).toUpperCase()}
											</span>
											<StatusBadge variant={variant}>
												<AlertTriangle className="h-3 w-3" />
												{breach.severity}
											</StatusBadge>
											<StatusBadge variant="success">
												<CheckCircle2 className="h-3.5 w-3.5" />
												{breach.status}
											</StatusBadge>
										</div>
										<h3 className="mt-2 text-lg font-bold text-neutral-900 dark:text-white">
											{breach.title}
										</h3>
										<div className="mt-1 flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
											<Clock className="h-3.5 w-3.5" />
											{breach.createdAt}
										</div>
										<p className="mt-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
											{breach.description}
										</p>
										<div className="mt-3 text-sm text-neutral-600 dark:text-neutral-300">
											<span className="text-neutral-400 dark:text-neutral-500">
												{t('common.affectedUsers')}
											</span>
											{breach.affectedUsers ?? '—'}
										</div>
									</SectionCard>
								);
							})}
						</div>
					)}

					{breachData && breachData.items.length === 0 && (
						<div className="mt-4">
							<EmptyState
								title={t('incidents.noBreaches')}
								description={t('incidents.noBreachesDesc')}
								icon={<CheckCircle2 className="h-6 w-6 text-success" />}
							/>
						</div>
					)}
				</div>

				{/* Historical Incidents */}
				<div className="mt-16">
					<h2 className="text-xl font-bold text-neutral-900 dark:text-white">
						{t('incidents.historical')}
					</h2>
					<div className="mt-6 space-y-6">
						{staticIncidents.map((inc) => {
							const severityLabel = t(
								`incidents.severity.${inc.severity === '低' ? 'low' : inc.severity === '中' ? 'medium' : 'high'}`,
								'',
							);
							return (
								<SectionCard key={inc.id} padding="lg">
									<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
										<div className="flex-1">
											<div className="flex flex-wrap items-center gap-3">
												<span className="font-mono text-xs text-neutral-500 dark:text-neutral-400">
													{inc.id}
												</span>
												<span
													className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${severityStyles[inc.severity === '低' ? 'low' : inc.severity === '中' ? 'medium' : 'high']}`}
												>
													<AlertTriangle className="h-3 w-3" />
													{severityLabel}
												</span>
												<span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
													<CheckCircle2 className="h-3.5 w-3.5" />
													{inc.status}
												</span>
											</div>
											<h3 className="mt-2 text-lg font-bold text-neutral-900 dark:text-white">
												{inc.title}
											</h3>
											<div className="mt-1 flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
												<Clock className="h-3.5 w-3.5" />
												{inc.date}
											</div>
											<p className="mt-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
												{inc.description}
											</p>
											<div className="mt-4 grid gap-3 sm:grid-cols-2">
												<div className="rounded-lg border border-neutral-100 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-slate-800/50">
													<div className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
														{t('common.impactScope')}
													</div>
													<p className="mt-1 text-sm text-neutral-700 dark:text-neutral-300">
														{inc.impact}
													</p>
												</div>
												<div className="rounded-lg border border-neutral-100 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-slate-800/50">
													<div className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
														{t('common.resolutionMeasure')}
													</div>
													<p className="mt-1 text-sm text-neutral-700 dark:text-neutral-300">
														{inc.resolution}
													</p>
												</div>
											</div>
										</div>
									</div>
								</SectionCard>
							);
						})}
					</div>
				</div>

				{/* Response Process */}
				<div className="mt-16">
					<h2 className="text-center text-2xl font-bold text-neutral-900 dark:text-white">
						{t('incidents.responseProcess')}
					</h2>
					<div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
						{processSteps.map((s) => (
							<SectionCard key={s.step} padding="md">
								<div className="text-2xl font-bold text-primary-200 dark:text-primary-800">
									{s.step}
								</div>
								<h3 className="mt-2 text-base font-semibold text-neutral-900 dark:text-white">
									{s.title}
								</h3>
								<p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{s.desc}</p>
							</SectionCard>
						))}
					</div>
				</div>

				<div className="mt-12 rounded-xl border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-slate-900/50">
					<div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<h3 className="text-base font-semibold text-neutral-900 dark:text-white">
								{t('incidents.subscribe')}
							</h3>
							<p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
								{t('incidents.subscribeDesc')}
							</p>
						</div>
						<a
							href={STATUS_PAGE_URL()}
							target="_blank"
							rel="noreferrer"
							className="inline-flex shrink-0 items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
						>
							{t('incidents.visitStatus')}
							<ExternalLink className="h-4 w-4" />
						</a>
					</div>
				</div>
			</div>
		</div>
	);
}
