'use client';

import { usePageTitle, usePageMeta } from '@autional-cn/shared';
import { useStorageEncryptionStatus, usePublicReports } from '@/hooks/useTrustApi';
import { useTranslation } from 'react-i18next';
import { PageHeader, SectionCard, LoadingScreen, ErrorState, EmptyState } from '@autional-cn/ui';
import type { PublicEncryptionStatus, PublicReport } from '@autional-cn/shared/generated/types';
import {
	Shield,
	Lock,
	Key,
	Server,
	Globe,
	FileText,
	Download,
	Database,
	Loader2,
	AlertTriangle,
} from 'lucide-react';

function formatFileSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string): string {
	try {
		const d = new Date(dateStr);
		return d.toLocaleDateString();
	} catch {
		return dateStr;
	}
}

export default function StorageSecurityPage() {
	const { t, i18n } = useTranslation();

	usePageTitle(t('storageSecurity.title'));
	usePageMeta(
		i18n.language === 'zh-CN'
			? 'Autional 存储安全 — 加密算法、静态/传输加密状态、密钥管理与公开安全报告。'
			: 'Autional Storage Security — Encryption algorithms, at-rest/in-transit status, key management and public reports.',
	);

	const {
		data: encryptionStatus,
		isLoading: encLoading,
		isError: encError,
		refetch: refetchEnc,
	} = useStorageEncryptionStatus();

	const {
		data: reportsData,
		isLoading: reportsLoading,
		isError: reportsError,
		refetch: refetchReports,
	} = usePublicReports(1, 50);

	const reports: PublicReport[] = reportsData?.items ?? [];

	return (
		<div className="px-4 py-12 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-7xl">
				<PageHeader title={t('storageSecurity.title')} subtitle={t('storageSecurity.subtitle')} />

				{/* Encryption Status */}
				<SectionCard title={t('storageSecurity.encryptionStatus')} className="mt-8">
					<p className="mb-6 text-sm text-neutral-500 dark:text-neutral-400">
						{t('storageSecurity.encryptionDesc')}
					</p>

					{encLoading ? (
						<LoadingScreen />
					) : encError ? (
						<ErrorState onRetry={() => refetchEnc()} />
					) : encryptionStatus ? (
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
							<EncryptionCard
								icon={Shield}
								label={t('storageSecurity.algorithm')}
								value={encryptionStatus.algorithm || '—'}
								enabled={true}
							/>
							<EncryptionCard
								icon={Database}
								label={t('storageSecurity.atRest')}
								value={encryptionStatus.encryptionAtRest ? t('storageSecurity.enabled') : '—'}
								enabled={!!encryptionStatus.encryptionAtRest}
							/>
							<EncryptionCard
								icon={Globe}
								label={t('storageSecurity.inTransit')}
								value={encryptionStatus.encryptionInTransit ? t('storageSecurity.enabled') : '—'}
								enabled={!!encryptionStatus.encryptionInTransit}
							/>
							<EncryptionCard
								icon={Key}
								label={t('storageSecurity.keyManagement')}
								value={encryptionStatus.keyManagement || '—'}
								enabled={true}
							/>
						</div>
					) : null}
				</SectionCard>

				{/* Public Reports */}
				<div className="mt-12">
					<h2 className="text-xl font-bold text-neutral-900 dark:text-white">
						{t('storageSecurity.publicReports')}
					</h2>
					<p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
						{t('storageSecurity.publicReportsDesc')}
					</p>

					{reportsLoading && (
						<div className="mt-4 flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
							<Loader2 className="h-4 w-4 animate-spin" />
							{t('common.loading')}
						</div>
					)}

					{reportsError && (
						<div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-500 dark:border-neutral-800 dark:bg-slate-900/50">
							<AlertTriangle className="mb-1 inline h-4 w-4" />
							{t('common.loadFailed')}
						</div>
					)}

					{!reportsLoading && !reportsError && reports.length > 0 && (
						<div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{reports.map((report) => (
								<ReportCard
									key={report.id}
									report={report}
									t={t}
									formatFileSize={formatFileSize}
									formatDate={formatDate}
								/>
							))}
						</div>
					)}

					{!reportsLoading && !reportsError && reports.length === 0 && (
						<div className="mt-4">
							<EmptyState
								title={t('storageSecurity.noReports')}
								description={t('storageSecurity.noReportsDesc')}
							/>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

function EncryptionCard({
	icon: Icon,
	label,
	value,
	enabled,
}: {
	icon: React.FC<{ className?: string }>;
	label: string;
	value: string;
	enabled: boolean;
}) {
	return (
		<div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-slate-800">
			<div className="flex items-center gap-3">
				<div
					className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
						enabled ? 'bg-primary-50 dark:bg-primary-900/20' : 'bg-neutral-100 dark:bg-slate-700'
					}`}
				>
					<Icon
						className={`h-5 w-5 ${
							enabled ? 'text-primary-600' : 'text-neutral-400 dark:text-neutral-500'
						}`}
					/>
				</div>
				<div className="min-w-0">
					<div className="text-xs text-neutral-400 dark:text-neutral-500">{label}</div>
					<div className="mt-0.5 truncate text-sm font-semibold text-neutral-900 dark:text-white">
						{value}
					</div>
				</div>
			</div>
		</div>
	);
}

function ReportCard({
	report,
	t,
	formatFileSize,
	formatDate,
}: {
	report: PublicReport;
	t: (key: string) => string;
	formatFileSize: (bytes: number) => string;
	formatDate: (dateStr: string) => string;
}) {
	const downloadUrl = `/storage/api/v1/storage/public/reports/${report.id}/download`;

	return (
		<SectionCard padding="lg">
			<div className="flex flex-col gap-3">
				<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/20">
					<FileText className="h-5 w-5 text-primary-600" />
				</div>
				<div className="flex-1">
					<h3 className="text-sm font-bold text-neutral-900 dark:text-white line-clamp-2">
						{report.title}
					</h3>
					{report.description && (
						<p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">
							{report.description}
						</p>
					)}
					<div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-400 dark:text-neutral-500">
						{report.createdAt && <span>{formatDate(report.createdAt)}</span>}
						{report.size != null && <span>{formatFileSize(report.size)}</span>}
						{report.contentType && (
							<span className="font-mono">
								{report.contentType.split('/').pop()?.toUpperCase()}
							</span>
						)}
					</div>
				</div>
				<a
					href={downloadUrl}
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex items-center gap-1.5 self-start rounded-md bg-primary-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary-700"
				>
					<Download className="h-3.5 w-3.5" />
					{t('storageSecurity.downloadReport')}
				</a>
			</div>
		</SectionCard>
	);
}
