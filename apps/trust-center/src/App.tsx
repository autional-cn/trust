import { Routes, Route } from 'react-router';
import { Suspense, lazy } from 'react';

import TrustLayout from '@/components/layout/TrustLayout';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Eagerly loaded pages
import OverviewPage from '@/app/page';

// Lazy loaded pages
const CompliancePage = lazy(() => import('@/app/compliance/page'));
const SecurityPage = lazy(() => import('@/app/security/page'));
const DataResidencyPage = lazy(() => import('@/app/data-residency/page'));
const AuditReportsPage = lazy(() => import('@/app/audit-reports/page'));
const IncidentsPage = lazy(() => import('@/app/incidents/page'));
const PrivacyPage = lazy(() => import('@/app/privacy/page'));
const DevicePrivacyPage = lazy(() => import('@/app/privacy/device/page'));
const SubprocessorsPage = lazy(() => import('@/app/subprocessors/page'));
const VulnerabilityDisclosurePage = lazy(() => import('@/app/vulnerability-disclosure/page'));
const StorageSecurityPage = lazy(() => import('@/app/storage-security/page'));
const SecurityAlertsPage = lazy(() => import('@/app/security-alerts/page'));
const SecurityAlertsConfirmPage = lazy(() => import('@/app/security-alerts/confirm/page'));
const SecurityAlertsUnsubscribePage = lazy(() => import('@/app/security-alerts/unsubscribe/page'));
const NotFoundPage = lazy(() => import('@/app/not-found/page'));

function PageLoader() {
	return (
		<div className="flex min-h-[50vh] items-center justify-center">
			<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
		</div>
	);
}

export default function App() {
	return (
		<ErrorBoundary>
			<Routes>
				<Route element={<TrustLayout />}>
					<Route path="/" element={<OverviewPage />} />
					<Route
						path="/compliance"
						element={
							<Suspense fallback={<PageLoader />}>
								<CompliancePage />
							</Suspense>
						}
					/>
					<Route
						path="/security"
						element={
							<Suspense fallback={<PageLoader />}>
								<SecurityPage />
							</Suspense>
						}
					/>
					<Route
						path="/data-residency"
						element={
							<Suspense fallback={<PageLoader />}>
								<DataResidencyPage />
							</Suspense>
						}
					/>
					<Route
						path="/audit-reports"
						element={
							<Suspense fallback={<PageLoader />}>
								<AuditReportsPage />
							</Suspense>
						}
					/>
					<Route
						path="/incidents"
						element={
							<Suspense fallback={<PageLoader />}>
								<IncidentsPage />
							</Suspense>
						}
					/>
					<Route
						path="/privacy"
						element={
							<Suspense fallback={<PageLoader />}>
								<PrivacyPage />
							</Suspense>
						}
					/>
					<Route
						path="/privacy/device"
						element={
							<Suspense fallback={<PageLoader />}>
								<DevicePrivacyPage />
							</Suspense>
						}
					/>
					<Route
						path="/subprocessors"
						element={
							<Suspense fallback={<PageLoader />}>
								<SubprocessorsPage />
							</Suspense>
						}
					/>
					<Route
						path="/vulnerability-disclosure"
						element={
							<Suspense fallback={<PageLoader />}>
								<VulnerabilityDisclosurePage />
							</Suspense>
						}
					/>
					<Route
						path="/storage-security"
						element={
							<Suspense fallback={<PageLoader />}>
								<StorageSecurityPage />
							</Suspense>
						}
					/>
					<Route
						path="/security-alerts"
						element={
							<Suspense fallback={<PageLoader />}>
								<SecurityAlertsPage />
							</Suspense>
						}
					/>
					<Route
						path="/security-alerts/confirm"
						element={
							<Suspense fallback={<PageLoader />}>
								<SecurityAlertsConfirmPage />
							</Suspense>
						}
					/>
					<Route
						path="/security-alerts/unsubscribe"
						element={
							<Suspense fallback={<PageLoader />}>
								<SecurityAlertsUnsubscribePage />
							</Suspense>
						}
					/>
					<Route
						path="*"
						element={
							<Suspense fallback={<PageLoader />}>
								<NotFoundPage />
							</Suspense>
						}
					/>
				</Route>
			</Routes>
		</ErrorBoundary>
	);
}
