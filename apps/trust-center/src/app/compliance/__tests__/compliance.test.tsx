import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import CompliancePage from '../page';

vi.mock('react-router', async () => {
	const actual = await vi.importActual('react-router');
	return { ...actual, Link: ({ to, children }: any) => <a href={to}>{children}</a> };
});

vi.mock('react-i18next', () => {
	const certMap: Record<string, Record<string, unknown>> = {
		iso27001: {
			name: 'ISO 27001',
			status: '已认证',
			certNo: 'Autional-ISMS-2024-001',
			validFrom: '2024-03-15',
			validTo: '2027-03-14',
			scope: 'test scope',
			controls: ['信息安全策略与治理', '人力资源安全与背景调查', '访问控制与身份管理'],
		},
		soc2: {
			name: 'SOC 2 Type II',
			status: '已认证',
			certNo: 'Autional-SOC2-2024-002',
			validFrom: '2024-01-01',
			validTo: '2024-12-31',
			scope: 'test scope',
			controls: ['逻辑与物理访问控制', '系统运维与监控', '变更管理'],
		},
		gdpr: {
			name: 'GDPR',
			status: '合规',
			certNo: '—',
			validFrom: '2018-05-25',
			validTo: '持续合规',
			scope: 'test scope',
			controls: ['数据主体权利自动化（DSAR）', '数据可携带性与删除权'],
		},
		djbh: {
			name: '等保三级',
			status: '已备案',
			certNo: 'Autional-DJBH-2024-003',
			validFrom: '2024-06-01',
			validTo: '2025-05-31',
			scope: 'test scope',
			controls: ['安全物理环境', '安全通信网络'],
		},
	};
	const zhCN: Record<string, string> = {
		'compliance.title': '合规认证',
		'compliance.subtitle': 'Autional 持续接受第三方独立审计',
		'compliance.latestFindings': '最新审计发现',
		'compliance.findingsDesc': '来自合规系统的实时审计发现（需登录查看）',
		'compliance.noFindings': '当前无未关闭的高风险审计发现',
		'compliance.noFindingsDesc': '系统合规状态良好。',
		'compliance.needReport': '需要查看完整审计报告？',
		'compliance.needReportDesc':
			'Enterprise 客户可在签订 NDA 后获取完整 SOC 2 报告和 ISO 27001 认证文件。',
		'compliance.applyReport': '申请报告',
		'compliance.loadingFindings': '加载审计发现...',
		'compliance.findingsLoadFailed': '审计发现加载失败，请登录后查看完整信息。',
		'compliance.controlType': '控制类型',
		'compliance.controlId': '控制编号',
		'compliance.dueDate': '截止日期',
		'common.certNo': '证书编号',
		'common.validPeriod': '有效期',
		'common.controlsCovered': '涵盖控制项',
		'common.auditor': '审计机构',
		'common.scope': '范围',
		'common.certified': '已认证',
		'common.viewCertificate': '查看证书',
		'common.labels.certNo': '证书编号',
		'common.labels.validFrom': '有效期起',
		'common.labels.validTo': '有效期止',
		'common.labels.controls': '涵盖控制项',
		'common.labels.completed': '已完成',
	};
	return {
		useTranslation: () => ({
			t: (key: string, opts?: any) => {
				if (opts?.returnObjects) {
					// 数组字段（controls）→ 返回数组
					const m = key.match(/^compliance\.certifications\.(\w+)\.controls$/);
					if (m && certMap[m[1]]?.controls) return certMap[m[1]].controls;
					return key;
				}
				// 逐字段 key: compliance.certifications.<cert>.<field>
				const fieldMatch = key.match(/^compliance\.certifications\.(\w+)\.(\w+)$/);
				if (fieldMatch) {
					const val = certMap[fieldMatch[1]]?.[fieldMatch[2]];
					if (val !== undefined) return String(val);
				}
				return zhCN[key] || key;
			},
			i18n: { language: 'zh-CN' },
		}),
	};
});

vi.mock('@autional-cn/shared', () => ({
	usePageTitle: vi.fn(),
	usePageMeta: vi.fn(),
}));

vi.mock('@/hooks/useTrustApi', () => ({
	useAuditFindings: vi.fn(),
	useComplianceStatus: () => ({
		data: null,
		isLoading: false,
		isError: false,
	}),
	useSecurityScore: () => ({
		data: null,
		isLoading: false,
		isError: false,
	}),
	usePublicCertifications: () => ({
		data: null,
		isLoading: false,
		isError: false,
	}),
}));

vi.mock('@autional-cn/ui', () => ({
	PageHeader: ({ title, subtitle }: any) => (
		<div>
			<h1>{title}</h1>
			<p>{subtitle}</p>
		</div>
	),
	SectionCard: ({ children }: any) => <div>{children}</div>,
	StatusBadge: ({ children }: any) => <span data-testid="status-badge">{children}</span>,
	EmptyState: ({ title, description }: any) => (
		<div data-testid="empty-state">
			<h3>{title}</h3>
			<p>{description}</p>
		</div>
	),
}));

import { useAuditFindings } from '@/hooks/useTrustApi';

function renderCompliance() {
	return render(
		<MemoryRouter>
			<CompliancePage />
		</MemoryRouter>,
	);
}

beforeEach(() => {
	vi.clearAllMocks();
});

describe('CompliancePage', () => {
	it('renders compliance page with certifications', () => {
		vi.mocked(useAuditFindings).mockReturnValue({
			data: undefined,
			isLoading: false,
			isError: false,
		} as any);

		renderCompliance();

		expect(screen.getByText('合规认证')).toBeInTheDocument();
		expect(screen.getByText('ISO 27001')).toBeInTheDocument();
		expect(screen.getByText('SOC 2 Type II')).toBeInTheDocument();
		expect(screen.getByText('GDPR')).toBeInTheDocument();
		expect(screen.getByText('等保三级')).toBeInTheDocument();
		expect(screen.getAllByText('已认证').length).toBeGreaterThan(0);
	});

	it('shows loading state for audit findings', () => {
		vi.mocked(useAuditFindings).mockReturnValue({
			data: undefined,
			isLoading: true,
			isError: false,
		} as any);

		renderCompliance();

		expect(screen.getByText('加载审计发现...')).toBeInTheDocument();
	});

	it('shows audit findings when data loaded', () => {
		vi.mocked(useAuditFindings).mockReturnValue({
			data: {
				items: [
					{
						id: 'FIND-1',
						title: 'Access Control Review Needed',
						severity: 'HIGH',
						status: 'OPEN',
						controlType: 'Access Control',
						controlId: 'AC-1',
						dueDate: '2026-06-01',
					},
					{
						id: 'FIND-2',
						title: 'Encryption Key Rotation',
						severity: 'MEDIUM',
						status: 'IN_PROGRESS',
						controlType: 'Cryptography',
						controlId: 'CR-2',
						dueDate: '2026-05-25',
					},
				],
			},
			isLoading: false,
			isError: false,
		} as any);

		renderCompliance();

		expect(screen.getByText('Access Control Review Needed')).toBeInTheDocument();
		expect(screen.getByText('Encryption Key Rotation')).toBeInTheDocument();
	});

	it('shows empty state when no audit findings', () => {
		vi.mocked(useAuditFindings).mockReturnValue({
			data: { items: [] },
			isLoading: false,
			isError: false,
		} as any);

		renderCompliance();

		expect(screen.getByTestId('empty-state')).toBeInTheDocument();
		expect(screen.getByText('当前无未关闭的高风险审计发现')).toBeInTheDocument();
	});

	it('shows error state when audit findings fail', () => {
		vi.mocked(useAuditFindings).mockReturnValue({
			data: undefined,
			isLoading: false,
			isError: true,
		} as any);

		renderCompliance();

		expect(screen.getByText('审计发现加载失败，请登录后查看完整信息。')).toBeInTheDocument();
	});
});
