import { useTrustSEO } from '@/lib/seo';
import { useTranslation } from 'react-i18next';
import { Shield } from 'lucide-react';

export default function DevicePrivacyPage() {
	const { t } = useTranslation();
	useTrustSEO({
		title: t('privacy.device.title'),
		description: t('privacy.device.meta'),
		noindex: true,
	});

	return (
		<div className="px-4 py-12 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-4xl">
				<div className="text-center">
					<h1 className="text-3xl font-bold tracking-tight text-[var(--color-text-primary)] sm:text-4xl">
						{t('privacy.device.title')}
					</h1>
					<p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--color-text-muted)]">
						{t('privacy.device.subtitle')}
					</p>
				</div>

				<div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-white p-12 dark:border-neutral-800 dark:bg-slate-900">
					<Shield className="h-16 w-16 text-[var(--color-text-muted)]" />
					<p className="mt-4 text-sm text-[var(--color-text-muted)]">
						{t('privacy.device.comingSoon')}
					</p>
				</div>
			</div>
		</div>
	);
}
