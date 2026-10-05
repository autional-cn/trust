import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

// 回归锁：禁止源码使用 `text-neutral-*` 文本色工具类。
// 背景（trust 站内容审计 TR-01/TR-05，2026-10-05）：tokens.css 的 `.dark` 块把 neutral
// 色阶整体反转（neutral-300→#1f3350 深海军蓝、400→#2a4060…），经典 Tailwind 心智的
// `dark:text-neutral-300/400` 在深色主题下实际渲染成深色 → 对比度 1.0~1.6:1 失明；
// 浅色侧 neutral-400/500 在白底同样不达 4.5:1（1.86:1 / 2.91:1）。文本色一律走语义令牌：
// `text-[var(--color-text-primary)]`（标题，浅 #041d31 / 深 #f8fbfe）或
// `text-[var(--color-text-muted)]`（次级，浅 #64748d / 深 #8896a6，双主题 AA 达标）；
// 语义前景色同理走 `--color-success-text` / `--color-warning-text` / `--color-info-text`。
// border-/bg-neutral- 不在管辖内。SVG stroke=currentColor 的轨道色用固定设计色。
const BANNED = /text-neutral-\d/;

// 回归锁 2：禁止对预设色板（primary/neutral/sky/amber/chart）与语义色
// （success/warning/danger/info/brand/accent）使用透明度修饰符（`/NN`）。
// 背景（TR-01 深色族根因，2026-10-05 复核）：本仓 tailwind-preset 把这些色
// 全部映射为纯 `var(--color-*)`（无 `<alpha-value>` 通道），Tailwind 3.4 对
// 此类颜色**静默丢弃**带 `/NN` 的工具类 —— `dark:bg-primary-900/20` 并非
// 被覆盖，而是根本不生成规则，深色下背景回退为浅色 `bg-primary-50`（浅底浅字
// 失明）。允许 `/NN` 的只有默认色板（white/slate/gray/emerald/rose…自带 alpha
// 通道）。深色面用 `dark:bg-white/10`、软底用 `bg-[var(--color-success-soft)]`
// 等语义令牌替代。
const DEAD_ALPHA =
	/(?:bg|text|border|from|to|via|ring|divide|fill|stroke|placeholder|decoration|outline)-(?:primary|neutral|sky|amber|chart|success|warning|danger|info|brand|accent|on-brand)[\w-]*\/\d+/;

// vitest 以本包目录为 cwd 运行
const SRC_ROOT = resolve(process.cwd(), 'src');

function collectSourceFiles(dir: string): string[] {
	const out: string[] = [];
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		if (entry.name === '__tests__' || entry.name === 'test') continue;
		const full = join(dir, entry.name);
		if (entry.isDirectory()) {
			out.push(...collectSourceFiles(full));
		} else if (/\.tsx?$/.test(entry.name)) {
			out.push(full);
		}
	}
	return out;
}

function findOffenders(pattern: RegExp): string[] {
	const offenders: string[] = [];
	for (const file of collectSourceFiles(SRC_ROOT)) {
		const content = readFileSync(file, 'utf8');
		if (pattern.test(content)) {
			offenders.push(file.slice(SRC_ROOT.length));
		}
	}
	return offenders;
}

describe('主题类回归锁', () => {
	it('源码不使用 text-neutral-*（深色主题下被反转为深色，恒失明）', () => {
		expect(findOffenders(BANNED)).toEqual([]);
	});

	it('不对预设色板/语义色使用透明度修饰符（无 alpha 通道，规则被静默丢弃）', () => {
		expect(findOffenders(DEAD_ALPHA)).toEqual([]);
	});
});
