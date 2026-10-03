import { useSecurityScore } from '@/hooks/use-trust-api';
import { useTranslation } from 'react-i18next';
import { Shield, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

const DIMENSION_KEYS: Record<string, string> = {
	iso27001_coverage: 'iso27001Coverage',
	soc2_coverage: 'soc2Coverage',
	gdpr_compliance: 'gdprCoverage',
	open_issues: 'openIssues',
	penetration_test: 'penetrationTest',
	breach_history: 'breachHistory',
};

const DIMENSION_COLORS: Record<string, string> = {
	iso27001_coverage: 'text-success',
	soc2_coverage: 'text-primary-500',
	gdpr_compliance: 'text-info',
	open_issues: 'text-warning',
	penetration_test: 'text-violet-500',
	breach_history: 'text-rose-500',
};

interface RingChartProps {
	label: string;
	score: number;
	color: string;
}

function RingChart({ label, score, color }: RingChartProps) {
	return (
		<div className="flex flex-col items-center gap-1">
			<div className="relative flex h-14 w-14 items-center justify-center">
				<svg className="h-14 w-14 -rotate-90" viewBox="0 0 36 36">
					<path
						className="text-neutral-100 dark:text-slate-800"
						d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
						fill="none"
						stroke="currentColor"
						strokeWidth="3"
					/>
					<path
						className={color}
						strokeDasharray={`${score}, 100`}
						d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
						fill="none"
						stroke="currentColor"
						strokeWidth="3"
						strokeLinecap="round"
					/>
				</svg>
				<span className="absolute text-xs font-bold text-neutral-900 dark:text-white">{score}</span>
			</div>
			<span className="text-xs text-neutral-500 dark:text-neutral-400">{label}</span>
		</div>
	);
}

export default function SecurityScore() {
	const { t } = useTranslation();
	const { data: score, isLoading, isError } = useSecurityScore();

	if (isLoading) {
		return (
			<div className="flex items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-slate-900">
				<Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
				<span className="text-sm text-neutral-500">{t('overview.loadingStatus')}</span>
			</div>
		);
	}

	if (isError || !score) {
		return (
			<div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-slate-900/50">
				<AlertTriangle className="h-5 w-5 text-warning" />
				<span className="text-sm text-neutral-600 dark:text-neutral-300">
					{t('overview.loadFailed')}
				</span>
			</div>
		);
	}

	const overallScore = score.overallScore ?? 0;
	const grade = score.grade ?? '';
	const calculatedAt = score.calculatedAt ?? '';
	const dimensions = (score.dimensions ?? []).sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0));

	const scoreColor =
		overallScore >= 90 ? 'text-success' : overallScore >= 70 ? 'text-warning' : 'text-danger';
	const scoreBg =
		overallScore >= 90 ? 'bg-success/10' : overallScore >= 70 ? 'bg-warning/10' : 'bg-danger/10';

	return (
		<div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-slate-900">
			<div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
				<div className="flex items-center gap-4">
					<div className={`flex h-14 w-14 items-center justify-center rounded-full ${scoreBg}`}>
						<Shield className={`h-7 w-7 ${scoreColor}`} />
					</div>
					<div>
						<div className="text-sm font-medium text-neutral-900 dark:text-white">
							{t('overview.securityScore')}
						</div>
						<div className="flex items-baseline gap-2">
							<span className={`text-3xl font-bold ${scoreColor}`}>{overallScore}</span>
							<span className="text-sm text-neutral-400">/ {score.maxScore ?? 100}</span>
							{grade && (
								<span className="ml-1 rounded bg-primary-50 px-1.5 py-0.5 text-xs font-semibold text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
									{grade}
								</span>
							)}
						</div>
					</div>
				</div>

				<div className="flex gap-6">
					{dimensions.slice(0, 4).map((dim) => (
						<RingChart
							key={dim.name}
							label={t(`overview.dimensions.${DIMENSION_KEYS[dim.name ?? ''] ?? 'unknown'}`)}
							score={dim.score ?? 0}
							color={DIMENSION_COLORS[dim.name ?? ''] ?? 'text-neutral-400'}
						/>
					))}
				</div>

				<div className="text-right">
					<div className="flex items-center justify-end gap-1.5 text-sm text-neutral-600 dark:text-neutral-300">
						<CheckCircle2 className="h-4 w-4 text-neutral-400" />
						<span>{t('common.realTimeLabel')}</span>
					</div>
					{calculatedAt && (
						<div className="mt-1 text-xs text-neutral-400">
							<span>
								{t('overview.calculatedAt')}: {new Date(calculatedAt).toLocaleDateString()}
							</span>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
