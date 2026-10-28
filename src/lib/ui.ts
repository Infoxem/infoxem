import { twMerge } from 'tailwind-merge';

/** Shared Tailwind recipes. All utility names are static so Tailwind can discover them. */
const recipes: Record<string, string> = {
  muted: 'text-[var(--muted)]',
  tiny: 'text-[12px]',
  'icon-button':
    'w-[31px] h-[31px] inline-flex justify-center items-center rounded-[6px] text-[#7b8595] relative shrink-0 [&:hover]:bg-[#eef2f7] [&:hover]:text-[#344562]',
  'collapse-button': 'w-[23px]',
  'page-heading':
    'flex justify-between items-center gap-[20px] mb-[26px] [&_h1]:text-[25px] [&_h1]:tracking-[-0.8px] [&_h1]:leading-[1.4] [&_h1]:font-semibold [&_p]:mt-[6px] [&_p]:text-[13px] [&_p]:text-[#718096] [@media(max-width:1200px)]:[&_h1]:text-[22px] [@media(max-width:960px)]:[&_h1]:text-[20px] [@media(max-width:960px)]:[&_p]:text-[12px] [@media(max-width:960px)]:[&_.button]:text-[12px] [@media(max-width:960px)]:[&_.button]:p-[8px_9px] [@media(max-width:720px)]:items-start [@media(max-width:720px)]:gap-[12px] [@media(max-width:720px)]:flex-wrap [@media(max-width:720px)]:mb-[20px] [@media(max-width:720px)]:[&_h1]:text-[22px] [@media(max-width:720px)]:[&_p]:text-[12px] [@media(max-width:720px)]:[&_p]:leading-[1.8] [@media(max-width:720px)]:[&_p]:mt-[4px] [@media(max-width:720px)]:[&_.button]:text-[12px] [@media(max-width:720px)]:[&_.button]:p-[8px_11px]',
  eyebrow:
    'font-semibold text-[#718096] tracking-[1.65px] mb-[8px] text-[10px] [@media(max-width:720px)]:text-[11px] [@media(max-width:720px)]:mb-[6px]',
  button:
    'inline-flex items-center justify-center gap-[7px] rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-40 min-h-[35px] p-[8px_12px] [border:1px_solid_#e0e5ed] rounded-[6px] shadow-[0_1px_2px_#26354a04] text-[12px] [&:hover]:border-[#c8d4e8] [&:hover]:bg-[#f8faff] [&.primary]:bg-primary [&.primary]:text-white [&.primary]:border-[var(--primary)] [&.primary]:shadow-[0_3px_6px_#245be316] [&.primary:hover]:[background:var(--primary-dark)] [&.primary:hover]:border-[var(--primary-dark)] [&.selected]:bg-[#f2f5fc] [&.selected]:border-[#dbe4f6] [&.selected]:text-[#4f6591] [@media(min-width:1600px)]:text-[13px]',
  badge:
    'text-[11px] p-[3px_7px] rounded-[4px] bg-[#f4f6f9] [border:1px_solid_#ebeff4] inline-flex items-center gap-[4px] text-[#657185] font-normal leading-[1.5] whitespace-nowrap [&.blue]:bg-[#edf2ff] [&.blue]:border-[#e3eaff] [&.blue]:text-[#4d72cb] [&.green]:bg-[#eff8f4] [&.green]:border-[#e0f1e7] [&.green]:text-[#4b9373] [@media(min-width:1600px)]:text-[12px] [&.neutral]:text-[#637187] [&.hero]:text-[11px] [&.hero]:text-[#5974a2] [&.hero]:bg-[#ffffff96] [&.hero]:[border:1px_solid_#dfe7f6] [&.hero]:tracking-[1px] [&.hero]:p-[4px_8px]',
  'live-dot': 'inline-block w-[5px] h-[5px] bg-[#4aaa8e] rounded-full shrink-0',
  blue: 'text-[#4a72be] bg-[#edf2fc]',
  purple: 'text-[#8b6cbb] bg-[#f2edfa]',
  teal: 'text-[#479286] bg-[#eaf6f3]',
  green: 'text-[#5c9564] bg-[#eef6ed]',
  orange: 'text-[#c78e4e] bg-[#fcf2e7]',
  rose: 'text-[#b4748a] bg-[#fbf0f3]',
  panel:
    'min-w-0 overflow-hidden rounded-lg border border-line bg-white [border:1px_solid_var(--line)] rounded-[8px] shadow-[0_2px_4px_#24365302]',
  'panel-heading':
    'flex items-center justify-between p-[20px_21px] gap-[12px] [border-bottom:1px_solid_var(--line)] [&_h2]:text-[14px] [&_h2]:tracking-[-0.15px] [&_h2]:flex [&_h2]:items-center [&_h2]:gap-[8px] [&_p]:text-[12px] [&_p]:mt-[4px] [&_p]:leading-[1.8] [&_p]:text-[#718096] [&_>_svg]:text-[#718096] [@media(min-width:1600px)]:p-[22px_24px] [@media(min-width:1600px)]:[&_h2]:text-[15px] [@media(min-width:1600px)]:[&_p]:text-[12px] [@media(max-width:1200px)]:p-[18px_16px] [@media(max-width:1200px)]:[&_h2]:text-[13px]',
  'text-link':
    'inline-flex gap-[5px] items-center text-[12px] text-primary font-medium whitespace-nowrap [&:hover]:text-[#1645b8] [&:hover]:underline [@media(max-width:1200px)]:text-[11px]',
  'table-scroll': 'w-full overflow-x-auto',
  identity:
    'flex w-fit min-w-0 items-center gap-2.5 gap-[10px] w-[fit-content] [&_strong]:block [&_strong]:font-[550] [&_strong]:text-[#3c495d] [&_strong]:text-[12px] [&_small]:block [&_small]:text-[11px] [&_small]:mt-[3px] [&_small]:text-[#718096] [&:hover_strong]:text-primary [@media(min-width:1600px)]:[&_strong]:text-[13px] [@media(min-width:1600px)]:[&_small]:text-[12px]',
  'company-logo':
    'h-[33px] w-[33px] rounded-[7px] grid place-items-center text-[21px] font-semibold tracking-[-2px] [font-style:normal] [border:1px_solid_#ffffff30] shrink-0 [&.blue]:[font-family:Arial] [&.blue]:font-[800] [&.teal]:font-[800] [&.purple]:text-[18px] [&.purple]:[font-family:Georgia] [&.large]:w-[63px] [&.large]:h-[63px] [&.large]:text-[36px] [&.large]:rounded-[13px] [@media(min-width:1600px)]:w-[38px] [@media(min-width:1600px)]:h-[38px] [@media(max-width:720px)]:[&.large]:w-[53px] [@media(max-width:720px)]:[&.large]:h-[53px] [@media(max-width:720px)]:[&.large]:text-[30px] [@media(max-width:720px)]:[&.large]:rounded-[11px]',
  'country-cell':
    'inline-flex items-center gap-[5px] text-[12px] text-[#69778b] [@media(min-width:1600px)]:text-[12px]',
  bookmark: 'text-[#a4adbb] w-[25px] h-[25px] [&.is-saved]:text-primary [&.is-saved]:bg-[#eef3ff]',
  'panel-footer':
    '[border-top:1px_solid_var(--line)] p-[12px_19px] text-[#718096] flex items-center gap-[6px] bg-[#fdfefe] text-[11px]',
  'sample-label':
    'flex items-center gap-[6px] whitespace-nowrap text-[11px] text-[#718096] [@media(max-width:720px)]:text-[11px]',
  'industry-chip':
    'inline-flex items-center gap-[6px] p-[5px_7px] text-[11px] [border:1px_solid_#e6edf9] bg-[#f4f7ff] rounded-[4px] text-[#7890b9] [@media(max-width:720px)]:text-[10px]!',
  'person-avatar':
    'w-[33px] h-[33px] rounded-[50%] grid place-items-center text-[12px]! font-semibold shrink-0 [&.large]:w-[66px] [&.large]:h-[66px] [&.large]:text-[20px]! [&.large]:[border:4px_solid_white] [&.large]:shadow-[0_0_0_1px_#e5eaf3] [@media(max-width:720px)]:[&.large]:w-[56px] [@media(max-width:720px)]:[&.large]:h-[56px] [@media(max-width:720px)]:[&.large]:text-[16px]!',
  'contact-button':
    'inline-flex items-center gap-[6px] text-[11px] p-[5px_7px] rounded-[5px] [border:1px_solid_#dce7fb] bg-[#f7faff] text-[#6b8fcb] whitespace-nowrap [&:hover]:bg-[#edf3fe] [&.unavailable]:bg-white [&.unavailable]:text-[#718096] [&.unavailable]:border-[#e8edf3] [@media(min-width:1600px)]:text-[12px]',
  'data-disclaimer':
    'mt-[17px] flex items-center justify-center gap-[6px] text-[#718096] text-[11px] leading-[1.8] [@media(max-width:720px)]:leading-[1.8] [@media(max-width:720px)]:text-center [@media(max-width:720px)]:items-start [@media(max-width:720px)]:gap-[5px] [@media(max-width:720px)]:p-[0_4px] [@media(max-width:720px)]:text-[10px] [@media(max-width:720px)]:[&_>_svg]:mt-[1px] [@media(max-width:720px)]:[&_>_svg]:w-[12px]',
  wide: 'w-full mt-[4px]',
  'not-found':
    'flex flex-col items-center justify-center gap-[18px] p-[50px] min-h-[100vh] [&_h1]:text-[30px] [&_p]:text-[var(--muted)] [@media(max-width:720px)]:p-[25px] [@media(max-width:720px)]:text-center [@media(max-width:720px)]:[&_h1]:text-[25px]',
  'loading-workspace': 'grid place-items-center min-h-[100vh] text-[#718096] text-[14px]',
  platform: 'min-h-[100vh]',
  sidebar:
    'fixed inset-[0_auto_0_0] w-[var(--sidebar)] bg-white [border-right:1px_solid_var(--line)] flex flex-col z-[35] p-[0_13px] overflow-y-auto [@media(max-width:1200px)]:p-[0_9px] [@media(max-width:720px)]:w-[232px] [@media(max-width:720px)]:[transform:translateX(-100%)] [@media(max-width:720px)]:[transition:transform_0.2s] [@media(max-width:720px)]:z-[60] [@media(max-width:720px)]:pb-[10px] [@media(max-width:720px)]:[visibility:hidden]',
  'brand-row':
    'h-[79px] flex items-center justify-between p-[0_9px] shrink-0 [@media(max-width:1200px)]:p-[0_7px] [@media(min-width:721px)]:h-[70px]',
  brand:
    'flex items-center gap-[9px] font-[750] text-[27px] tracking-[-1.3px] [@media(max-width:1200px)]:text-[25px] [@media(max-width:960px)]:text-[23px]',
  'brand-symbol':
    'bg-primary w-[33px] h-[34px] text-white grid place-items-center rounded-[9px] shadow-[0_3px_8px_#245be322] [@media(max-width:960px)]:w-[29px] [@media(max-width:960px)]:h-[30px] [@media(max-width:960px)]:[&_svg]:w-[20px]',
  'brand-dot': 'text-primary',
  'workspace-button':
    'flex items-center gap-[9px] text-left p-[10px] [border:1px_solid_var(--line)] rounded-[8px] m-[0_3px_24px] w-[calc(100%_-_6px)] shadow-[0_2px_3px_#1a2c4403] [&_>_span:nth-child(2)]:flex-1 [&_strong]:block [&_strong]:text-[13px] [&_small]:block [&_small]:text-[12px] [&_small]:text-[var(--muted)] [&_small]:mt-[1px] [&_>_svg]:text-[#8c96a5] [@media(max-width:960px)]:p-[8px] [@media(max-width:960px)]:gap-[7px] [@media(max-width:960px)]:[&_strong]:text-[12px] [@media(max-width:960px)]:[&_small]:text-[11px] [@media(min-width:721px)]:mb-[17px]',
  'workspace-avatar':
    'w-[31px] h-[31px] grid place-items-center bg-[#eef3fe] [border:1px_solid_#dce6fc] rounded-[7px] text-primary text-[14px] font-semibold',
  'nav-link':
    'flex items-center w-full gap-[11px] rounded-[6px] p-[11px_12px] text-[#657082] mb-[4px] text-left whitespace-nowrap text-[13px] [&_>_svg]:[stroke-width:1.65] [&:hover]:bg-[#f6f8fb] [&:hover]:text-[var(--ink)] [&.active]:text-primary [&.active]:bg-[#edf2ff] [&.active]:font-semibold [&.active_>_svg]:[stroke-width:2] [&_small]:ml-[auto] [&_small]:text-[12px] [&_small]:bg-[#edf0f5] [&_small]:rounded-[4px] [&_small]:p-[1px_6px] [&_small]:text-[#6e7b8c] [&_.badge]:ml-[auto] [&_.soon]:ml-[auto] [@media(max-width:960px)]:p-[10px] [@media(max-width:960px)]:gap-[9px] [@media(max-width:960px)]:text-[12px] [@media(max-width:720px)]:text-[13px] [@media(min-width:721px)]:pt-[9px] [@media(min-width:721px)]:pb-[9px] [@media(min-width:721px)]:mb-[3px]',
  'nav-label':
    'p-[24px_12px_9px] text-[#718096] font-semibold text-[11px] tracking-[1.25px] [@media(min-width:721px)]:pt-[17px]',
  soon: 'text-[11px] bg-[#f6f7f9] p-[1px_5px] [border:1px_solid_#eef0f3] rounded-[4px] text-[#718096]',
  'sidebar-bottom':
    'mt-[auto] pt-[24px] [&_.nav-link]:p-[9px_12px] [&_.nav-link]:text-[12px] [&_.nav-link_>_svg:last-child:not(:first-child)]:ml-[auto] [@media(min-width:721px)]:pt-[15px]',
  'plan-card':
    'p-[14px_12px] [background:linear-gradient(125deg,_#f2f6ff,_#f8faff)] [border:1px_solid_#e4ecfd] rounded-[8px] m-[0_3px_15px] [&_>_div]:flex [&_>_div]:gap-[6px] [&_>_div]:items-start [&_strong]:tracking-[-0.1px] [&_strong]:text-[11px] [&_strong]:whitespace-normal [&_strong]:leading-[1.6] [&_p]:text-[#8290a9] [&_p]:leading-[1.7] [&_p]:m-[7px_0_11px] [&_p]:text-[11px] [&_a]:flex [&_a]:items-center [&_a]:justify-between [&_a]:text-primary [&_a]:font-semibold [&_a]:text-[11px] [@media(max-width:960px)]:p-[12px_9px] [@media(max-width:960px)]:[&_strong]:text-[11px] [@media(max-width:960px)]:[&_p]:text-[11px] [@media(max-width:960px)]:[&_a]:text-[11px] [@media(max-width:1200px)]:[&_strong]:text-[10px] [@media(max-width:1200px)]:[&_p]:text-[10px] [@media(max-width:1200px)]:[&_a]:text-[10px] [@media(max-width:720px)]:[&_strong]:text-[11px] [@media(max-width:720px)]:[&_p]:text-[11px] [@media(max-width:720px)]:[&_a]:text-[11px] [@media(min-width:721px)]:mb-[10px]',
  'plan-icon': 'text-primary flex mt-[2px]',
  'account-button':
    '[border-top:1px_solid_var(--line)] flex gap-[10px] items-center text-left w-full p-[17px_8px_19px] mt-[13px] [&_>_span:nth-child(2)]:flex-1 [&_strong]:block [&_strong]:text-[12px] [&_small]:block [&_small]:text-[var(--muted)] [&_small]:mt-[2px] [&_small]:text-[11px] [&_svg]:text-[#9aa4b3] [@media(min-width:721px)]:pt-[14px] [@media(min-width:721px)]:pb-[14px] [@media(min-width:721px)]:mt-[8px]',
  'user-avatar':
    'inline-flex items-center justify-center w-[32px] h-[32px] bg-[#f0eafa] text-[#7957a5] [border:2px_solid_#fff] shadow-[0_0_0_1px_#e8e3f1] rounded-[50%] font-semibold text-[12px] shrink-0 [@media(max-width:720px)]:w-[29px] [@media(max-width:720px)]:h-[29px]',
  'app-content': 'ml-[var(--sidebar)] min-w-0',
  topbar:
    'h-[65px] flex items-center justify-between gap-[20px] p-[0_34px] bg-white [border-bottom:1px_solid_var(--line)] sticky top-[0] z-[25] [@media(max-width:1200px)]:p-[0_24px] [@media(max-width:1200px)]:gap-[14px] [@media(max-width:960px)]:p-[0_20px] [@media(max-width:720px)]:h-[59px] [@media(max-width:720px)]:p-[0_16px] [@media(max-width:720px)]:gap-[10px] [&_.global-search]:text-[12px]',
  'topbar-start': 'flex items-center gap-[10px] [@media(max-width:720px)]:gap-[6px]',
  'workspace-crumb':
    'flex items-center gap-[10px] text-[#9aa2af] text-[12px] [&_strong]:font-medium [&_strong]:text-[#556174] [@media(max-width:720px)]:text-[12px] [@media(max-width:720px)]:gap-[6px] [@media(max-width:720px)]:[&_>_svg]:w-[11px]',
  'global-search':
    'flex items-center gap-[10px] [border:1px_solid_#e9edf2] bg-[#fafbfc] rounded-[6px] p-[8px_10px] w-[310px] text-[12px] ml-[auto] text-[#718096] [&_kbd]:[font:10px_Inter,_Arial] [&_kbd]:ml-[auto] [&_kbd]:text-[#718096] [&_kbd]:bg-white [&_kbd]:[border:1px_solid_#e5e9ee] [&_kbd]:rounded-[3px] [&_kbd]:p-[0_4px] [@media(max-width:1200px)]:w-[235px] [@media(max-width:960px)]:w-[200px] [@media(max-width:720px)]:ml-[auto] [@media(max-width:720px)]:w-[34px] [@media(max-width:720px)]:justify-center [@media(max-width:720px)]:p-[8px] [@media(max-width:720px)]:bg-transparent [@media(max-width:720px)]:border-[transparent] [@media(max-width:720px)]:min-w-[30px] [@media(max-width:720px)]:[&_span]:hidden [@media(max-width:720px)]:[&_kbd]:hidden',
  'topbar-actions':
    'flex gap-[19px] items-center [&_.icon-button_i]:absolute [&_.icon-button_i]:right-[6px] [&_.icon-button_i]:top-[5px] [&_.icon-button_i]:w-[4px] [&_.icon-button_i]:h-[4px] [&_.icon-button_i]:rounded-full [&_.icon-button_i]:bg-primary [&_.icon-button_i]:[border:1px_solid_white] [@media(max-width:960px)]:gap-[12px] [@media(max-width:720px)]:gap-[8px] [@media(max-width:720px)]:[&_.icon-button]:w-[27px]',
  'demo-label':
    'text-[12px] text-[#6d7887] flex items-center gap-[6px] whitespace-nowrap [&_>_span]:w-[5px] [&_>_span]:h-[5px] [&_>_span]:rounded-full [&_>_span]:bg-[#43ad86] [@media(max-width:960px)]:hidden',
  'topbar-divider': 'h-[21px] w-[1px] [background:var(--line)] [@media(max-width:720px)]:hidden',
  'menu-button': 'hidden [@media(max-width:720px)]:flex',
  'is-collapsed':
    '[--sidebar:72px] [&_.sidebar]:p-[0_9px] [&_.brand-row]:p-0 [&_.brand-row]:justify-center [&_.brand_>_span:last-child]:hidden [&_.collapse-button]:hidden [&_.workspace-button]:hidden [&_.nav-link_>_span]:hidden [&_.nav-link_>_small]:hidden [&_.nav-link_>_.badge]:hidden [&_.plan-card]:hidden [&_.nav-label]:hidden [&_.account-button_>_span:not(.user-avatar)]:hidden [&_.account-button_>_svg]:hidden [&_.nav-link]:justify-center [&_.nav-link]:p-[13px_10px] [&_nav]:pt-[12px] [&_.sidebar-bottom_.nav-link_>_svg:last-child]:m-0 [&_.account-button]:justify-center [&_.account-button]:p-[18px_0] [&_.menu-button]:flex [@media(max-width:720px)]:[--sidebar:0px] [@media(max-width:720px)]:[&_.sidebar]:w-[72px]',
  'nav-backdrop': 'hidden',
  'mobile-nav-open':
    '[@media(max-width:720px)]:[&_.sidebar]:[transform:translateX(0)] [@media(max-width:720px)]:[&_.sidebar]:[visibility:visible] [@media(max-width:720px)]:[&_.nav-backdrop]:block [@media(max-width:720px)]:[&_.nav-backdrop]:fixed [@media(max-width:720px)]:[&_.nav-backdrop]:inset-[0] [@media(max-width:720px)]:[&_.nav-backdrop]:bg-[#20324d55] [@media(max-width:720px)]:[&_.nav-backdrop]:z-[55]',
  'skip-link':
    'fixed top-[10px] left-[10px] z-[150] [transform:translateY(-200%)] rounded-[6px] bg-[#245be3] p-[12px_18px] text-white text-[13px] [&:focus]:[transform:translateY(0)]',
  wave: 'text-[#ddb26d] text-[26px] pl-[5px] [@media(max-width:720px)]:text-[24px]',
  'hero-panel':
    'flex min-h-[284px] rounded-[11px] [background:linear-gradient(110deg,_#eff4ff_0%,_#f0f6fc_45%,_#edf7f7_100%)] [border:1px_solid_#e2eaf7] overflow-hidden relative [@media(min-width:1600px)]:min-h-[330px] [@media(min-width:1600px)]:[&_.network-visual]:w-[40%] [@media(max-width:720px)]:min-h-[320px] [&_.visual-caption]:text-[8px] [@media(max-width:1200px)]:[&_.network-visual]:opacity-[0.65] [@media(max-width:960px)]:[&_.network-visual]:opacity-[0.35] [@media(max-width:720px)]:[&_.network-visual]:opacity-[0.18] [@media(max-width:720px)]:[&_.desktop-break]:hidden',
  'hero-copy':
    'p-[28px_32px] relative z-[2] w-[68%] [&_h2]:text-[31px] [&_h2]:tracking-[-1.2px] [&_h2]:leading-[1.24] [&_h2]:m-[14px_0_11px] [&_h2]:text-[#20375c] [&_h2]:font-semibold [&_>_p]:leading-[1.85] [&_>_p]:text-[13px] [&_>_p]:text-[#657b9b] [@media(min-width:1600px)]:p-[34px_40px] [@media(min-width:1600px)]:w-[65%] [@media(min-width:1600px)]:[&_h2]:text-[36px] [@media(min-width:1600px)]:[&_>_p]:text-[14px] [@media(min-width:1600px)]:[&_.button]:p-[10px_16px] [@media(min-width:1600px)]:[&_.button]:text-[13px] [@media(max-width:1200px)]:p-[28px_25px] [@media(max-width:1200px)]:w-[75%] [@media(max-width:1200px)]:[&_h2]:text-[29px] [@media(max-width:1200px)]:[&_>_p]:text-[12px] [@media(max-width:960px)]:p-[24px] [@media(max-width:960px)]:w-full [@media(max-width:960px)]:[&_h2]:text-[27px] [@media(max-width:720px)]:w-full [@media(max-width:720px)]:p-[23px_20px] [@media(max-width:720px)]:[&_h2]:text-[28px] [@media(max-width:720px)]:[&_>_p]:leading-[1.9] [@media(max-width:720px)]:[&_>_p]:max-w-[90%] [@media(max-width:720px)]:[&_>_p]:text-[12px] [@media(max-width:720px)]:[&_.badge]:text-[11px] [@media(max-width:960px)]:[&_>_p]:text-[12px] [@media(max-width:960px)]:[&_.hero-foot]:text-[10px] [@media(max-width:960px)]:[&_.hero-secondary]:text-[11px] [@media(max-width:720px)]:[&_.hero-foot]:text-[9px] [@media(max-width:720px)]:[&_.hero-foot]:gap-[4px] [@media(max-width:720px)]:[&_.hero-foot]:mt-[18px] [@media(max-width:720px)]:[&_.hero-foot]:max-w-full [@media(max-width:720px)]:[&_.hero-secondary]:text-[10px] [@media(max-width:720px)]:[&_.badge.hero]:text-[9px] [@media(max-width:720px)]:[&_.badge.hero]:tracking-[0.6px]',
  'hero-actions':
    'flex items-center gap-[22px] mt-[20px] [@media(max-width:1200px)]:gap-[15px] [@media(max-width:960px)]:gap-[14px] [@media(max-width:720px)]:mt-[21px] [@media(max-width:720px)]:gap-[17px] [@media(max-width:720px)]:flex-wrap',
  'hero-secondary':
    'font-medium text-[#5a7092] flex gap-[7px] items-center text-[12px] [&:hover]:text-primary [@media(min-width:1600px)]:text-[12px] [@media(max-width:1200px)]:text-[11px] [@media(max-width:960px)]:text-[11px] [@media(max-width:720px)]:text-[11px]',
  'hero-foot':
    'flex items-center gap-[7px] text-[#8c9bb0] mt-[21px] text-[11px] flex-wrap [&_>_span]:m-[0_2px] [@media(min-width:1600px)]:mt-[25px] [@media(min-width:1600px)]:text-[12px] [@media(max-width:960px)]:text-[11px] [@media(max-width:720px)]:text-[11px] [@media(max-width:720px)]:gap-[5px] [@media(max-width:720px)]:mt-[21px] [@media(max-width:720px)]:[&_svg]:w-[12px] [@media(max-width:1200px)]:text-[10px] [@media(max-width:720px)]:[&_>_svg]:w-[11px] [@media(max-width:720px)]:[&_span]:m-0',
  'network-visual':
    'absolute right-[0] top-[0] bottom-[0] w-[42%] overflow-hidden [isolation:isolate] [@media(max-width:960px)]:opacity-[0.7] [@media(max-width:960px)]:w-[35%] [@media(max-width:960px)]:right-[-30px] [@media(max-width:720px)]:w-[45%] [@media(max-width:720px)]:opacity-[0.22] [@media(max-width:720px)]:right-[-30px]',
  orbit:
    'absolute [border:1px_solid_#ccdce777] rounded-[50%] left-[49%] top-[46%] [transform:translate(-50%,_-50%)]',
  'orbit-one':
    'w-[150px] h-[150px] [border-style:dashed] animate-[research-orbit_32s_linear_infinite] [@media(min-width:1600px)]:w-[180px] [@media(min-width:1600px)]:h-[180px]',
  'orbit-two':
    'w-[236px] h-[236px] border-[#e8edf7] [@media(min-width:1600px)]:w-[320px] [@media(min-width:1600px)]:h-[320px]',
  'orbit-three':
    'w-[385px] h-[385px] [@media(min-width:1600px)]:w-[460px] [@media(min-width:1600px)]:h-[460px]',
  'network-center':
    'absolute left-[49%] top-[46%] [transform:translate(-50%,_-50%)_rotate(-7deg)] w-[75px] h-[75px] bg-white [border:1px_solid_#e0e9f1] shadow-[0_12px_32px_#819cb525] rounded-[19px] grid place-items-center text-primary [&_svg]:[transform:rotate(7deg)] [@media(min-width:1600px)]:w-[87px] [@media(min-width:1600px)]:h-[87px]',
  'network-node':
    'absolute grid place-items-center w-[46px] h-[46px] [border:1px_solid_#fff] bg-[#ffffffbf] rounded-[12px] shadow-[0_5px_10px_#8ca4bb0a] [@media(min-width:1600px)]:w-[54px] [@media(min-width:1600px)]:h-[54px]',
  'node-a': 'left-[11%] top-[25%] text-[#6b8bd0] [transform:rotate(-9deg)]',
  'node-b': 'right-[13%] top-[18%] text-[#689d90] [transform:rotate(9deg)]',
  'node-c': 'right-[12%] bottom-[20%] text-[#829ac2] [transform:rotate(-7deg)]',
  'network-dot':
    'absolute [border:4px_solid_#f4f9fb] shadow-[0_0_0_1px_#dbe5f0] bg-[#a5bce5] w-[12px] h-[12px] rounded-full',
  'nd-one': 'left-[38%] top-[7%]',
  'nd-two': 'left-[24%] bottom-[18%] bg-[#99c5bb]',
  'floating-label':
    'absolute flex items-center gap-[6px] bg-[#ffffffed] [border:1px_solid_#e6edf5] shadow-[0_5px_18px_#6d8ca00c] p-[8px_10px] text-[11px] text-[#6d7e96] rounded-[6px] whitespace-nowrap [@media(min-width:1600px)]:text-[12px] [@media(min-width:1600px)]:p-[10px_13px] [@media(max-width:720px)]:hidden',
  'fl-one': 'right-[5%] top-[44%] [transform:rotate(3deg)]',
  'green-check':
    'bg-[#e4f3ed] text-[#4b9c7c] grid place-items-center w-[18px] h-[18px] rounded-[50%]',
  'fl-two':
    'left-[9%] bottom-[18%] [transform:rotate(-4deg)] [&_.live-dot]:ml-[6px] [&_.live-dot]:w-[4px] [&_.live-dot]:h-[4px]',
  'visual-caption':
    'absolute bottom-[19px] left-[50%] [transform:translateX(-50%)] text-[11px] tracking-[1.9px] whitespace-nowrap text-[#9aaebc]',
  'stats-grid':
    'grid grid-cols-[repeat(4,_minmax(0,_1fr))] gap-[15px] m-[22px_0_25px] [@media(min-width:1600px)]:gap-[22px] [@media(min-width:1600px)]:mt-[26px] [@media(max-width:1200px)]:gap-[12px] [@media(max-width:960px)]:gap-[9px] [@media(max-width:720px)]:grid-cols-[repeat(2,_minmax(0,_1fr))] [@media(max-width:720px)]:gap-[11px] [@media(max-width:720px)]:m-[16px_0_20px]',
  'stat-card':
    '[border:1px_solid_var(--line)] rounded-[8px] bg-white p-[15px_17px_13px] shadow-[0_2px_3px_#24365302] [&_>_small]:text-[#718096] [&_>_small]:block [&_>_small]:mt-[7px] [&_>_small]:text-[11px] [@media(min-width:1600px)]:p-[20px] [@media(min-width:1600px)]:[&_>_small]:text-[12px] [@media(max-width:1200px)]:p-[13px] [@media(max-width:960px)]:[&_>_small]:text-[10px] [@media(max-width:960px)]:p-[11px] [@media(max-width:720px)]:p-[14px] [@media(max-width:720px)]:[&_>_small]:text-[10px] [@media(max-width:1200px)]:[&_>_small]:text-[10px]',
  'stat-label':
    'text-[#7e8999] flex justify-between items-center text-[13px] [@media(min-width:1600px)]:text-[13px] [@media(max-width:960px)]:text-[11px] [@media(max-width:720px)]:text-[12px] [@media(max-width:1200px)]:text-[12px]',
  'stat-icon':
    'w-[29px] h-[29px] grid place-items-center rounded-[7px] [@media(max-width:960px)]:w-[23px] [@media(max-width:960px)]:h-[23px] [@media(max-width:960px)]:[&_svg]:w-[14px] [@media(max-width:720px)]:w-[25px] [@media(max-width:720px)]:h-[25px]',
  'stat-value':
    'flex justify-between items-center text-[27px] tracking-[-0.7px] font-semibold mt-[1px] [@media(min-width:1600px)]:text-[31px] [@media(max-width:960px)]:text-[24px] [@media(max-width:720px)]:text-[27px]',
  sparkline:
    'h-[30px] w-[95px] mt-[9px] [@media(max-width:1200px)]:w-[68px] [@media(max-width:960px)]:w-[45px] [@media(max-width:960px)]:h-[25px] [@media(max-width:720px)]:w-[75px]',
  'home-columns':
    'grid gap-[22px] grid-cols-[minmax(0,_1.8fr)_minmax(310px,_1fr)] [@media(min-width:1600px)]:gap-[26px] [@media(max-width:1200px)]:gap-[15px] [@media(max-width:1200px)]:grid-cols-[minmax(0,_1.7fr)_minmax(270px,_1fr)] [@media(max-width:960px)]:grid-cols-[minmax(0,_1fr)] [@media(max-width:720px)]:gap-[16px]',
  recommended:
    '[&_th:first-child]:pl-[21px] [&_td:first-child]:pl-[21px] [&_td]:pt-[18px] [&_td]:pb-[18px] [@media(min-width:1600px)]:[&_th]:text-[12px] [@media(min-width:1600px)]:[&_td]:pt-[21px] [@media(min-width:1600px)]:[&_td]:pb-[21px] [@media(max-width:1200px)]:[&_table]:min-w-[540px] [@media(max-width:720px)]:[&_.panel-heading]:p-[17px_15px] [@media(max-width:720px)]:[&_.panel-heading]:flex-wrap [@media(max-width:720px)]:[&_.panel-heading_h2]:gap-[6px] [@media(max-width:720px)]:[&_.panel-heading_h2]:text-[13px] [@media(max-width:720px)]:[&_.panel-heading_.badge]:text-[11px] [@media(max-width:720px)]:[&_.panel-heading_p]:leading-[1.8] [@media(max-width:720px)]:[&_.panel-heading_p]:text-[11px] [@media(max-width:720px)]:[&_.panel-heading_p]:max-w-[none] [@media(max-width:720px)]:[&_.panel-heading_.text-link]:text-[11px] [@media(max-width:720px)]:[&_.panel-heading_.text-link_svg]:w-[12px] [@media(max-width:720px)]:[&_th:first-child]:pl-[15px] [@media(max-width:720px)]:[&_td:first-child]:pl-[15px] [@media(max-width:720px)]:[&_table]:min-w-[520px] [&_table]:min-w-[600px] [&_td_.country-cell]:text-[12px]',
  'get-started':
    '[&_.panel-heading]:[border-bottom:0] [&_.panel-heading]:pb-[13px] [&_.panel-heading]:items-start [@media(max-width:1200px)]:[&_.panel-heading]:p-[18px_16px_13px] [@media(max-width:1200px)]:[&_.panel-heading_p]:text-[10px] [@media(max-width:960px)]:hidden [&_.panel-heading_p]:text-[11px] [@media(max-width:1200px)]:[&_.panel-heading_h2]:text-[13px]',
  'step-count':
    'text-[12px] text-[#98a1b0] [border:1px_solid_var(--line)] rounded-[5px] p-[3px_7px]',
  'progress-track':
    'h-[4px] bg-[#edf1f8] rounded-[8px] m-[0_21px_6px] [&_>_span]:block [&_>_span]:h-full [&_>_span]:bg-primary [&_>_span]:rounded-[8px] [&_>_span]:[transition:width_0.3s] [@media(max-width:1200px)]:ml-[16px] [@media(max-width:1200px)]:mr-[16px]',
  'onboarding-step':
    'flex items-center gap-[12px] m-[0_21px] [border-bottom:1px_solid_#f0f2f6] w-[calc(100%_-_42px)] text-left p-[19px_0] [&:last-of-type]:[border-bottom:0] [&_>_span:nth-child(2)]:flex-1 [&_strong]:block [&_strong]:font-[550] [&_strong]:text-[#56657a] [&_strong]:text-[12px] [&_small]:block [&_small]:text-[#718096] [&_small]:mt-[4px] [&_small]:text-[11px] [&_>_svg]:text-[#aeb7c5] [&:hover_strong]:text-primary [@media(min-width:1600px)]:p-[22px_0] [@media(min-width:1600px)]:[&_strong]:text-[13px] [@media(min-width:1600px)]:[&_small]:text-[12px] [@media(max-width:1200px)]:ml-[16px] [@media(max-width:1200px)]:mr-[16px] [@media(max-width:1200px)]:w-[calc(100%_-_32px)] [@media(max-width:1200px)]:gap-[9px] [@media(max-width:1200px)]:p-[17px_0] [@media(max-width:1200px)]:[&_strong]:text-[11px] [@media(max-width:1200px)]:[&_small]:text-[11px]',
  'step-number':
    'bg-[#f8fafc] [border:1px_solid_#e4eaf3] text-[#94a2b8] inline-flex items-center justify-center w-[27px] h-[27px] rounded-[50%] text-[12px] shrink-0 [&.done]:text-[#4f9b7e] [&.done]:bg-[#edf8f3] [&.done]:border-[#dcefe5]',
  'onboarding-note':
    'flex gap-[10px] p-[13px_14px] m-[0_18px_17px] bg-[#f8faff] [border:1px_solid_#edf2fc] rounded-[6px] text-[#718096] items-center text-[11px] [&_svg]:text-[#83a1da] [&_strong]:text-[#8398bb] [&_strong]:font-medium [&_strong]:block [&_strong]:mt-[1px] [@media(min-width:1600px)]:text-[12px] [@media(min-width:1600px)]:p-[17px] [@media(max-width:1200px)]:ml-[14px] [@media(max-width:1200px)]:mr-[14px]',
  'market-section': 'mt-[27px] [@media(max-width:720px)]:mt-[22px]',
  'section-title':
    'flex [align-items:baseline] justify-between mb-[13px] [&_h2]:text-[14px] [&_h2]:tracking-[-0.2px] [&_>_span]:text-[#718096] [&_>_span]:text-[11px] [@media(min-width:1600px)]:[&_h2]:text-[15px] [@media(max-width:960px)]:[&_>_span]:text-[11px] [@media(max-width:720px)]:items-start [@media(max-width:720px)]:gap-[8px] [@media(max-width:720px)]:[&_h2]:text-[13px] [@media(max-width:720px)]:[&_>_span]:max-w-[140px] [@media(max-width:720px)]:[&_>_span]:text-right [@media(max-width:720px)]:[&_>_span]:text-[10px]',
  'market-grid':
    'grid grid-cols-[repeat(4,_minmax(0,_1fr))] gap-[14px] [@media(max-width:1200px)]:gap-[10px] [@media(max-width:1200px)]:grid-cols-[repeat(2,_minmax(0,_1fr))] [@media(max-width:720px)]:gap-[10px]',
  'market-card':
    'flex items-start gap-[12px] bg-white [border:1px_solid_var(--line)] p-[16px_14px] rounded-[7px] [&:hover]:border-[#cddbf9] [&:hover]:shadow-[0_3px_10px_#245be308] [&_>_div]:flex-1 [&_>_div]:min-w-0 [&_strong]:font-[550] [&_strong]:text-[12px] [&_small]:block [&_small]:text-[#718096] [&_small]:mt-[4px] [&_small]:whitespace-normal [&_small]:leading-[1.7] [&_small]:text-[11px] [&_div_>_span]:flex [&_div_>_span]:items-center [&_div_>_span]:gap-[4px] [&_div_>_span]:text-[#8197ba] [&_div_>_span]:mt-[12px] [&_div_>_span]:text-[11px] [&_>_svg]:text-[#a4b0c3] [&_>_svg]:w-[13px] [&_>_svg]:mt-[3px] [@media(min-width:1600px)]:p-[20px] [@media(min-width:1600px)]:[&_strong]:text-[13px] [@media(min-width:1600px)]:[&_small]:text-[12px] [@media(min-width:1600px)]:[&_div_>_span]:text-[12px] [@media(max-width:1200px)]:[&_small]:text-[11px] [@media(max-width:1200px)]:p-[14px] [@media(max-width:720px)]:p-[12px_10px] [@media(max-width:720px)]:gap-[7px] [@media(max-width:720px)]:[&_strong]:text-[11px] [@media(max-width:720px)]:[&_small]:leading-[1.8] [@media(max-width:720px)]:[&_small]:whitespace-normal [@media(max-width:720px)]:[&_small]:text-[10px] [@media(max-width:720px)]:[&_>_svg]:w-[11px] [@media(max-width:720px)]:[&_div_>_span]:mt-[8px] [@media(max-width:720px)]:[&_div_>_span]:text-[10px]',
  'market-flag': 'text-[21px] leading-[1.3] [@media(max-width:720px)]:text-[18px]',
  'home-bottom':
    'flex items-center gap-[6px] text-[#718096] mt-[23px] text-[11px] [&_>_span:last-child]:ml-[auto] [&_>_span:last-child]:flex [&_>_span:last-child]:items-center [&_>_span:last-child]:gap-[6px] [@media(max-width:960px)]:[&_>_span:last-child]:hidden [@media(max-width:720px)]:text-[10px]',
  'home-page':
    '[@media(max-width:720px)]:[&_.page-heading_h1]:text-[23px] p-[31px_34px_20px] max-w-[1700px] m-[auto] [@media(min-width:1600px)]:p-[38px_45px_25px] [@media(max-width:1200px)]:p-[28px_24px_20px] [@media(max-width:960px)]:p-[23px_20px] [@media(max-width:720px)]:p-[24px_17px_20px]',
  'directory-page':
    'p-[31px_34px_20px] max-w-[1700px] m-[auto] [&_.page-heading_h1]:text-[26px] [&_.page-heading_h1]:tracking-[-0.7px] [&_.page-heading]:mb-[22px] [@media(min-width:1600px)]:p-[38px_45px_25px] [@media(max-width:1200px)]:p-[28px_24px_20px] [@media(max-width:1200px)]:[&_.page-heading_h1]:text-[21px] [@media(max-width:1200px)]:[&_.page-heading_p]:max-w-[500px] [@media(max-width:960px)]:p-[23px_20px] [@media(max-width:720px)]:p-[24px_17px_20px] [@media(max-width:720px)]:[&_.page-heading_h1]:leading-[1.3] [@media(max-width:720px)]:[&_.page-heading_h1]:text-[24px] [@media(max-width:720px)]:[&_.page-heading_p]:text-[12px] [@media(max-width:720px)]:[&_.page-heading]:mb-[21px] [&_.directory-table]:min-h-[380px] [&_.empty-state]:p-[85px_20px] [&_.results-heading]:min-h-[56px] [&_.results-heading]:h-[auto] [&_.results-heading]:pt-[14px] [&_.results-heading]:pb-[14px] [&_.results-heading]:gap-[12px] [&_.results-heading_>_span]:wrap-anywhere [&_.directory-shell]:overflow-hidden [&_.empty-state_h2]:text-[17px] [&_.empty-state_p]:text-[13px] [&_.empty-state_p]:leading-[1.8] [@media(max-width:720px)]:[&_.empty-state]:p-[70px_18px] [@media(max-width:720px)]:[&_.directory-table]:min-h-[330px] [@media(max-width:720px)]:[&_.results-heading]:flex-wrap [@media(max-width:720px)]:[&_.results-heading_>_span]:text-[11px]',
  'detail-page':
    'p-[31px_34px_20px] max-w-[1700px] m-[auto] [@media(min-width:1600px)]:p-[38px_45px_25px] [@media(max-width:1200px)]:p-[28px_24px_20px] [@media(max-width:960px)]:p-[23px_20px] [@media(max-width:720px)]:p-[24px_17px_20px]',
  'directory-shell': 'bg-white [border:1px_solid_var(--line)] rounded-[9px] overflow-hidden',
  'directory-top':
    'flex items-center justify-between p-[0_21px] [border-bottom:1px_solid_var(--line)] h-[57px] [@media(max-width:720px)]:h-[52px] [@media(max-width:720px)]:p-[0_13px] [@media(max-width:720px)]:[&_.sample-label]:text-[9px]',
  'directory-tabs':
    'h-full flex gap-[27px] [&_>_button]:flex [&_>_button]:items-center [&_>_button]:gap-[7px] [&_>_button]:[border-bottom:2px_solid_transparent] [&_>_button]:text-[12px] [&_>_button]:text-[#718096] [&_>_button]:p-[0_1px] [&_>_button]:relative [&_>_button]:top-[1px] [&_>_button.active]:text-primary [&_>_button.active]:border-[var(--primary)] [&_>_button.active]:font-semibold [&_>_button_>_span]:text-[11px] [&_>_button_>_span]:bg-[#f1f3f7] [&_>_button_>_span]:rounded-[4px] [&_>_button_>_span]:p-[1px_6px] [&_>_button_>_span]:text-[#8993a4] [&_>_button.active_>_span]:bg-[#edf2ff] [&_>_button.active_>_span]:text-[#6583cf] [@media(max-width:720px)]:gap-[16px] [@media(max-width:720px)]:[&_>_button]:text-[12px] [@media(max-width:720px)]:[&_>_button_>_span]:text-[10px]',
  'directory-toolbar':
    'flex items-center gap-[10px] p-[16px_18px] [border-bottom:1px_solid_var(--line)] [@media(max-width:1200px)]:gap-[8px] [@media(max-width:1200px)]:p-[14px] [@media(max-width:1200px)]:[&_.button]:p-[8px_10px] [@media(max-width:1200px)]:[&_.button]:text-[12px] [@media(max-width:960px)]:flex-wrap [@media(max-width:960px)]:[&_.toolbar-spacer]:hidden [@media(max-width:960px)]:[&_.list-search]:flex-1 [@media(max-width:960px)]:[&_.list-search]:w-[auto] [@media(max-width:960px)]:[&_.list-search]:min-w-[200px] [@media(max-width:960px)]:[&_>_.button:nth-last-child(2)]:ml-[auto] [@media(max-width:720px)]:p-[12px] [@media(max-width:720px)]:gap-[8px] [@media(max-width:720px)]:[&_>_.list-search]:min-w-[155px] [@media(max-width:720px)]:[&_.filter-toggle]:text-[11px] [@media(max-width:720px)]:[&_>_.button:nth-last-child(2)]:ml-[0] [&_.button]:text-[12px] [@media(max-width:720px)]:[&_.button]:text-[11px]',
  'list-search':
    'flex items-center gap-[8px] [border:1px_solid_#e5e9ef] rounded-[6px] p-[0_10px] min-h-[35px] w-[320px] text-[#98a2b2] [&_input]:border-0 [&_input]:[background:none] [&_input]:flex-1 [&_input]:min-w-0 [&_input]:w-full [&_input]:[outline:none] [&_input]:text-[12px] [&_input::placeholder]:text-[#718096] [&_input:focus]:[outline:none] [&:focus-within]:border-[#9db8f1] [&:focus-within]:shadow-[0_0_0_2px_#245be30b] [&_>_button]:flex [&_>_button]:text-[#9ca9bb] [&_>_button]:p-0 [@media(max-width:1200px)]:w-[260px] [@media(max-width:720px)]:[&_input]:text-[11px]',
  'toolbar-spacer': 'flex-1',
  'directory-body':
    'grid grid-cols-[224px_minmax(0,_1fr)] min-h-[645px] [&.filters-hidden]:grid-cols-[minmax(0,_1fr)] [@media(min-width:1600px)]:grid-cols-[245px_minmax(0,_1fr)] [@media(min-width:1600px)]:min-h-[740px] [@media(max-width:1200px)]:grid-cols-[200px_minmax(0,_1fr)] [@media(max-width:960px)]:grid-cols-[180px_minmax(0,_1fr)] [@media(max-width:720px)]:flex [@media(max-width:720px)]:flex-col [@media(max-width:720px)]:min-h-[500px]',
  'filter-panel':
    '[border-right:1px_solid_var(--line)] p-[0_16px] bg-[#fdfefe] min-w-0 [@media(min-width:1600px)]:p-[0_20px] [@media(max-width:1200px)]:p-[0_13px] [@media(max-width:720px)]:[border-right:0] [@media(max-width:720px)]:[border-bottom:1px_solid_var(--line)] [@media(max-width:720px)]:grid [@media(max-width:720px)]:grid-cols-[1fr_1fr] [@media(max-width:720px)]:gap-[0_15px] [@media(max-width:720px)]:p-[0_14px_10px]',
  'filter-heading':
    'flex items-center justify-between p-[17px_0_15px] text-[12px] [&_strong]:flex [&_strong]:items-center [&_strong]:gap-[7px] [&_strong]:font-[550] [&_strong]:text-[12px] [&_strong_svg]:text-[#8594aa] [&_button]:text-[#8ba2c6] [&_button]:p-0 [&_button]:text-[11px] [@media(max-width:720px)]:[grid-column:1/-1] [@media(max-width:720px)]:p-[13px_0_0] [@media(max-width:720px)]:text-[12px] [@media(max-width:720px)]:[&_button]:text-[11px]',
  'filter-intro':
    'flex items-center gap-[7px] bg-[#f6f9ff] [border:1px_solid_#e8eef9] text-[#718cbb] p-[9px_8px] rounded-[5px] m-[0_0_9px] text-[11px] [@media(max-width:720px)]:hidden',
  'filter-group':
    'p-[19px_0] [border-bottom:1px_solid_var(--line)] [&_h3]:font-medium [&_h3]:flex [&_h3]:items-center [&_h3]:gap-[7px] [&_h3]:mb-[13px] [&_h3]:text-[#69798f] [&_h3]:text-[12px] [&_h3_>_svg:first-child]:text-[#95a3b6] [&_h3_>_svg:last-child]:ml-[auto] [&_h3_>_svg:last-child]:text-[#a9b2bf] [&_select]:w-full [&_select]:[border:1px_solid_#e5eaf1] [&_select]:rounded-[5px] [&_select]:bg-white [&_select]:p-[9px_7px] [&_select]:cursor-pointer [&_select]:text-[11px] [&_select]:text-[#65748b] [&_small]:block [&_small]:text-[#718096] [&_small]:mt-[9px] [&_small]:text-[10px] [@media(min-width:1600px)]:[&_h3]:text-[12px] [@media(min-width:1600px)]:[&_select]:text-[12px] [@media(max-width:960px)]:[&_h3]:text-[11px] [@media(max-width:960px)]:[&_select]:text-[11px] [@media(max-width:720px)]:p-[13px_0] [@media(max-width:720px)]:[border-bottom:0] [@media(max-width:720px)]:[&_h3]:mb-[7px] [@media(max-width:720px)]:[&_h3]:text-[11px] [@media(max-width:720px)]:[&_select]:p-[7px_4px] [@media(max-width:720px)]:[&_select]:text-[11px] [@media(max-width:720px)]:[&_.industry-chip]:text-[11px] [@media(max-width:720px)]:[&_small]:hidden',
  'filter-tip':
    'mt-[24px] p-[15px_12px] rounded-[6px] [border:1px_dashed_#dfe7f3] bg-[#f9fbff] [&_>_svg]:text-[#8eabda] [&_>_svg]:mb-[8px] [&_strong]:block [&_strong]:text-[11px] [&_strong]:font-medium [&_strong]:text-[#7e94b5] [&_p]:leading-[1.9] [&_p]:text-[#718096] [&_p]:mt-[5px] [&_p]:text-[11px] [@media(max-width:720px)]:hidden',
  'results-panel': 'min-w-0 flex flex-col',
  'results-heading':
    'flex items-center justify-between h-[56px] p-[0_19px] text-[12px] text-[#718096] [&_strong]:text-[#586a82] [&_strong]:font-semibold [&_.badge]:ml-[8px] [@media(max-width:720px)]:h-[49px] [@media(max-width:720px)]:p-[0_13px] [@media(max-width:720px)]:text-[11px]',
  'sort-label':
    'flex items-center gap-[5px] text-[11px] text-[#718096] [&_select]:border-0 [&_select]:text-[#728299] [&_select]:bg-transparent [&_select]:cursor-pointer [&_select]:text-[11px] [@media(max-width:720px)]:text-[10px] [@media(max-width:720px)]:[&_select]:text-[10px]',
  'directory-table':
    'flex-1 [&_table]:min-w-[800px] [&_td]:p-[18px_12px] [&_td]:h-[75px] [&_th]:p-[12px] [&_.checkbox-cell]:w-[38px] [&_.checkbox-cell]:pr-[0] [&_.checkbox-cell]:pl-[18px] [&_.identity_strong]:text-[12px] [&_.identity_small]:text-[11px] [&_.identity]:gap-[9px] [&_.company-logo]:w-[31px] [&_.company-logo]:h-[31px] [&_.company-logo]:text-[18px] [&_.person-avatar]:w-[31px] [&_.person-avatar]:h-[31px] [&_.person-avatar]:text-[10px]! [@media(min-width:1600px)]:[&_td]:h-[83px] [@media(min-width:1600px)]:[&_.identity_strong]:text-[12px] [@media(min-width:1600px)]:[&_th]:text-[12px] [@media(min-width:1600px)]:[&_.identity_small]:text-[12px] [@media(min-width:1600px)]:[&_table]:text-[12px] [@media(max-width:720px)]:[&_table]:min-w-[800px] [@media(max-width:720px)]:[&_.identity_strong]:text-[12px] [@media(max-width:720px)]:[&_td]:h-[75px] [&_.product-tags]:flex-nowrap [&_.product-tags_.badge]:text-[10px]',
  'checkbox-cell': '[&_input]:align-middle',
  location:
    '[&_span]:block [&_span]:text-[12px] [&_span]:text-[#6b7b91] [&_small]:block [&_small]:text-[11px] [&_small]:text-[#718096] [&_small]:mt-[3px]',
  'product-tags':
    'flex flex-wrap gap-[4px] items-center [&_.badge]:text-[11px] [&_.badge]:bg-[#f8f9fb] [&_.badge]:p-[2px_5px] [&_.badge]:text-[#718096] [&_small]:text-[11px] [&_small]:text-[#718096]',
  'contact-count':
    'inline-flex gap-[6px] items-center text-[11px] text-[#607da9] [&_svg]:text-[#9badc6] [&:hover]:text-primary',
  'company-inline':
    'flex gap-[7px] items-center text-[11px] text-[#7d8ba0] [&_.company-logo]:w-[20px] [&_.company-logo]:h-[20px] [&_.company-logo]:text-[13px] [&_.company-logo]:rounded-[4px]',
  'row-selected': 'bg-[#f3f7ff]',
  pagination:
    'flex items-center justify-between p-[14px_19px] [border-top:1px_solid_var(--line)] text-[#718096] gap-[10px] text-[11px] [&_>_div]:flex [&_>_div]:items-center [&_>_div]:gap-[5px] [&_>_div_>_button]:flex [&_>_div_>_button]:items-center [&_>_div_>_button]:justify-center [&_>_div_>_button]:w-[25px] [&_>_div_>_button]:h-[26px] [&_>_div_>_button]:text-[11px] [&_>_div_>_button]:text-[#8b9bb3] [&_>_div_>_button]:rounded-[4px] [&_>_div_>_button.current]:[border:1px_solid_#dce6fa] [&_>_div_>_button.current]:bg-[#f0f5ff] [&_>_div_>_button.current]:text-primary [&_>_label]:flex [&_>_label]:gap-[9px] [&_>_label]:items-center [&_>_label]:text-[11px] [&_>_label]:text-[#b0b7c3] [&_strong]:flex [&_strong]:items-center [&_strong]:gap-[12px] [&_strong]:[border:1px_solid_#e6ebf2] [&_strong]:rounded-[4px] [&_strong]:p-[4px_7px] [&_strong]:text-[#8f9cb0] [&_strong]:text-[11px] [@media(max-width:720px)]:p-[13px] [@media(max-width:720px)]:flex-wrap [@media(max-width:720px)]:text-[11px] [@media(max-width:720px)]:[&_label]:hidden',
  'applied-filters':
    'flex gap-[7px] p-[0_18px_12px] [&_button]:flex [&_button]:items-center [&_button]:gap-[8px] [&_button]:text-[#6b8bbd] [&_button]:bg-[#f2f6fd] [&_button]:[border:1px_solid_#e1e9f7] [&_button]:rounded-[4px] [&_button]:p-[4px_7px] [&_button]:text-[11px]',
  'empty-state':
    'p-[90px_20px] text-center text-[#9aabc2] [&_>_svg]:m-[0_auto_15px] [&_>_svg]:text-[#b0c3e0] [&_h2]:text-[16px] [&_h2]:text-[#586d8a] [&_p]:text-[12px] [&_p]:m-[8px_0_20px]',
  'profile-main':
    'min-w-0 [&_>_.panel]:mb-[21px] [&_.panel-heading]:p-[18px_21px] [&_.panel-heading_h2]:text-[13px] [@media(min-width:1600px)]:[&_.panel-heading_h2]:text-[14px] [@media(max-width:960px)]:[&_.panel-heading_h2]:text-[12px] [@media(max-width:960px)]:[&_.panel-heading_>_.sample-label]:text-[11px] [@media(max-width:720px)]:w-full [@media(max-width:720px)]:min-w-0 [@media(max-width:720px)]:[&_.panel-heading]:p-[16px_17px] [@media(max-width:720px)]:[&_.panel-heading_h2]:text-[13px] [@media(max-width:720px)]:[&_.panel-heading_>_.sample-label]:text-[10px] [@media(max-width:720px)]:[&_.table-scroll_table]:min-w-[570px] [@media(max-width:720px)]:[&_.data-disclaimer]:mt-[10px] [@media(max-width:720px)]:[&_.contact-grid_.tiny]:text-[11px]',
  'directory-search-form':
    'flex gap-[10px] mb-[22px] max-w-[850px] [&_.list-search]:flex-1 [&_.list-search]:w-[auto] [&_.list-search]:min-h-[44px] [&_.list-search]:p-[0_14px] [&_.list-search]:bg-white [&_.list-search_input]:text-[13px] [&_>_.button]:min-h-[44px] [&_>_.button]:p-[10px_20px] [&_>_.button]:text-[13px] [@media(max-width:720px)]:gap-[8px] [@media(max-width:720px)]:mb-[18px] [@media(max-width:720px)]:flex-wrap [@media(max-width:720px)]:[&_.list-search]:min-w-0 [@media(max-width:720px)]:[&_.list-search]:p-[0_10px] [@media(max-width:720px)]:[&_.list-search]:[flex-basis:100%] [@media(max-width:720px)]:[&_.list-search_input]:text-[12px] [@media(max-width:720px)]:[&_>_.button]:p-[10px_13px] [@media(max-width:720px)]:[&_>_.button]:text-[12px] [@media(max-width:720px)]:[&_>_.button_>_svg]:block [&_>_.button.selected]:text-primary [&_>_.button.selected]:border-[#cad9fa] [&_>_.button.selected]:bg-[#eff4ff]',
  'search-filter-panel':
    'p-[18px_20px] [border-bottom:1px_solid_var(--line)] bg-[#fbfcfe] [@media(max-width:720px)]:p-[16px]',
  'search-filter-heading':
    'flex items-center justify-between mb-[14px] [&_strong]:text-[12px] [&_strong]:font-semibold [&_button]:text-primary [&_button]:text-[11px]',
  'search-filter-fields':
    'grid grid-cols-[repeat(auto-fit,_minmax(160px,_1fr))] gap-[16px] [&_label]:flex [&_label]:flex-col [&_label]:gap-[7px] [&_label]:text-[11px] [&_label]:text-[#718096] [&_select]:w-full [&_select]:p-[9px_10px] [&_select]:[border:1px_solid_#e0e7f1] [&_select]:rounded-[6px] [&_select]:bg-white [&_select]:text-[var(--ink)] [&_select]:text-[12px] [&_select]:min-h-[38px] [@media(max-width:720px)]:grid-cols-[1fr_1fr] [@media(max-width:720px)]:gap-[12px] [@media(max-width:720px)]:[&_select]:text-[11px] [@media(max-width:720px)]:[&_select]:p-[9px_6px]',
  'filter-count':
    'inline-grid place-items-center min-w-[18px] h-[18px] rounded-[4px] bg-[#edf2ff] text-primary text-[10px] p-[0_4px]',
  'directory-discovery-layout':
    'grid grid-cols-[minmax(0,_1fr)] items-start gap-[18px] [&.with-filters]:grid-cols-[264px_minmax(0,_1fr)] [&_>_.directory-shell]:min-w-0 [@media(max-width:1000px)]:[&.with-filters]:grid-cols-[235px_minmax(0,_1fr)] [@media(max-width:1000px)]:[&.with-filters]:gap-[12px] [@media(max-width:720px)]:[&.with-filters]:grid-cols-[minmax(0,_1fr)]',
  'apollo-filter-panel':
    'bg-white [border:1px_solid_var(--line)] rounded-[9px] overflow-hidden [&_>_header]:min-h-[56px] [&_>_header]:p-[16px] [&_>_header]:flex [&_>_header]:items-center [&_>_header]:justify-between [&_>_header]:[border-bottom:1px_solid_var(--line)] [&_>_header_strong]:flex [&_>_header_strong]:items-center [&_>_header_strong]:gap-[8px] [&_>_header_strong]:text-[13px] [&_>_header_strong]:font-semibold [&_>_header_button]:text-[11px] [&_>_header_button]:text-primary [&_footer]:p-[16px] [&_footer]:grid [&_footer]:gap-[10px] [&_footer]:bg-[#fbfcfe] [&_footer_.button]:w-full [&_footer_.button]:justify-center [&_footer_.button]:min-h-[38px]',
  'apollo-filter-group':
    '[border-bottom:1px_solid_var(--line)] [&_>_summary]:list-none [&_>_summary]:p-[17px_16px] [&_>_summary]:flex [&_>_summary]:items-center [&_>_summary]:gap-[10px] [&_>_summary]:cursor-pointer [&_>_summary]:text-[#465369] [&_>_summary]:text-[12px] [&_>_summary]:font-[550] [&_>_summary::-webkit-details-marker]:hidden [&_>_summary_>_svg:first-child]:text-[#8190a5] [&_>_summary_>_span]:flex-1 [&[open]_.refinement-chevron]:[transform:rotate(180deg)] [&_summary:focus-visible]:[outline:2px_solid_var(--primary)] [&_summary:focus-visible]:[outline-offset:2px]',
  'refinement-chevron': '[transition:transform_0.15s]',
  'apollo-filter-content': 'p-[0_16px_18px] grid gap-[13px]',
  'refinement-field':
    'grid gap-[7px] text-[#738096] text-[11px] [&_input]:w-full [&_input]:min-w-0 [&_input]:min-h-[37px] [&_input]:p-[9px_10px] [&_input]:[border:1px_solid_#dfe5ed] [&_input]:rounded-[6px] [&_input]:bg-white [&_input]:[font:inherit] [&_input]:text-[12px] [&_input]:text-[var(--ink)] [&_select]:w-full [&_select]:min-w-0 [&_select]:min-h-[37px] [&_select]:p-[9px_10px] [&_select]:[border:1px_solid_#dfe5ed] [&_select]:rounded-[6px] [&_select]:bg-white [&_select]:[font:inherit] [&_select]:text-[12px] [&_select]:text-[var(--ink)] [&_input::placeholder]:text-[#9ba5b4] [&_input:focus-visible]:[outline:2px_solid_var(--primary)] [&_input:focus-visible]:[outline-offset:2px] [&_select:focus-visible]:[outline:2px_solid_var(--primary)] [&_select:focus-visible]:[outline-offset:2px]',
  'refinement-dot': 'w-[6px] h-[6px] bg-primary rounded-[50%]',
  'refinement-help': 'text-[10px] leading-[1.7] text-[#8691a2] m-0',
  'reference-directory-table':
    '[&_table]:min-w-[1050px] [&_th]:whitespace-nowrap [&_td]:pt-[20px] [&_td]:pb-[20px] [&_.product-tags]:flex-wrap [&_.product-tags]:max-w-[230px]',
  'directory-row-actions': 'flex items-center gap-[10px]',
  'directory-view-link':
    'inline-flex items-center justify-center p-[6px_12px] [border:1px_solid_var(--line)] rounded-[5px] text-[#465369] text-[11px] [&:hover]:border-[var(--primary)] [&:hover]:text-primary',
  'directory-website-link': 'text-primary text-[12px] [&:hover]:underline',
  'directory-job-title':
    'block max-w-[210px] min-w-[140px] whitespace-normal text-[12px] leading-[1.6] text-[#637087]',
  'back-link':
    'text-[12px] inline-flex items-center gap-[6px] text-[#8795aa] mb-[25px] [&:hover]:text-primary [@media(max-width:720px)]:mb-[20px] [@media(max-width:720px)]:text-[12px]',
  'profile-header':
    'flex items-center justify-between gap-[22px] mb-[30px] [@media(max-width:960px)]:flex-wrap [@media(max-width:720px)]:mb-[23px] [@media(max-width:720px)]:gap-[20px]',
  'profile-identity':
    'flex items-center gap-[17px] [&_p]:text-[#929fb1] [&_p]:mt-[8px] [&_p]:text-[12px] [&_p_>_span]:p-[0_8px] [&_p_>_span]:text-[#b9c2ce] [&_p_a]:text-[#7391bf] [@media(max-width:720px)]:gap-[12px] [@media(max-width:720px)]:items-start [@media(max-width:720px)]:[&_p]:mt-[6px] [@media(max-width:720px)]:[&_p]:text-[11px]',
  'profile-title':
    'flex items-center gap-[13px] [&_h1]:tracking-[-0.8px] [&_h1]:leading-[1.3] [&_h1]:text-[26px] [&_.badge]:text-[11px] [@media(min-width:1600px)]:[&_h1]:text-[29px] [@media(max-width:1200px)]:gap-[8px] [@media(max-width:1200px)]:flex-wrap [@media(max-width:1200px)]:[&_h1]:text-[22px] [@media(max-width:720px)]:gap-[8px] [@media(max-width:720px)]:[&_h1]:text-[22px] [@media(max-width:720px)]:[&_.badge]:text-[9px] [@media(max-width:960px)]:[&_h1]:text-[23px]',
  'profile-meta':
    'flex gap-[17px] text-[#718096] mt-[8px] text-[11px] [&_>_span]:inline-flex [&_>_span]:gap-[5px] [&_>_span]:items-center [@media(max-width:1200px)]:gap-[10px] [@media(max-width:1200px)]:text-[11px] [@media(max-width:1200px)]:[&_svg]:w-[11px] [@media(max-width:720px)]:text-[10px] [@media(max-width:720px)]:flex-wrap [@media(max-width:720px)]:gap-[6px] [@media(max-width:960px)]:text-[10px]',
  'profile-actions':
    'flex gap-[9px] [@media(max-width:1200px)]:[&_.button]:text-[12px] [@media(max-width:1200px)]:[&_.button]:p-[8px_10px] [@media(max-width:960px)]:ml-[80px] [@media(max-width:720px)]:ml-[0] [@media(max-width:720px)]:w-full [@media(max-width:720px)]:gap-[10px] [@media(max-width:720px)]:[&_.button]:flex-1',
  'profile-layout':
    'grid grid-cols-[285px_minmax(0,_1fr)] gap-[25px] items-start [@media(min-width:1600px)]:grid-cols-[310px_minmax(0,_1fr)] [@media(min-width:1600px)]:gap-[30px] [@media(max-width:1200px)]:grid-cols-[250px_minmax(0,_1fr)] [@media(max-width:1200px)]:gap-[20px] [@media(max-width:960px)]:grid-cols-[215px_minmax(0,_1fr)] [@media(max-width:960px)]:gap-[17px] [@media(max-width:720px)]:flex [@media(max-width:720px)]:flex-col [@media(max-width:720px)]:gap-[17px]',
  'profile-rail':
    '[&_.panel-heading]:p-[17px_19px] [&_.panel-heading_h2]:text-[13px] [@media(max-width:720px)]:w-full [@media(max-width:720px)]:[&_.panel-heading]:p-[15px_17px]',
  'rail-body':
    'p-[19px] [&_>_p]:leading-[1.9] [&_>_p]:text-[#718096] [&_>_p]:mb-[20px] [&_>_p]:text-[12px] [&_dl]:m-0 [@media(min-width:1600px)]:p-[22px] [@media(min-width:1600px)]:[&_>_p]:text-[13px] [@media(max-width:960px)]:p-[15px] [@media(max-width:960px)]:[&_>_p]:text-[12px] [@media(max-width:720px)]:p-[17px] [@media(max-width:720px)]:[&_>_p]:text-[12px] [@media(max-width:720px)]:[&_>_p]:mb-[12px] [@media(max-width:720px)]:[&_dl]:grid [@media(max-width:720px)]:[&_dl]:grid-cols-[1fr_1fr] [@media(max-width:720px)]:[&_dl]:gap-[0_15px] [@media(max-width:720px)]:[&_.fact]:p-[10px_0] [@media(max-width:720px)]:[&_.fact_dd]:text-[11px]',
  fact: 'p-[13px_0] [border-bottom:1px_solid_#f0f3f7] [&_dt]:text-[#718096] [&_dt]:mb-[6px] [&_dt]:text-[11px] [&_dd]:text-[#6f8098] [&_dd]:m-0 [&_dd]:leading-[1.7] [&_dd]:text-[12px] [&:last-child]:[border-bottom:0] [@media(min-width:1600px)]:[&_dt]:text-[12px] [@media(min-width:1600px)]:[&_dd]:text-[13px] [@media(max-width:960px)]:[&_dd]:text-[11px] [@media(max-width:720px)]:[&_dt]:text-[11px] [@media(max-width:720px)]:[&_dd]:text-[12px]',
  'demo-profile-note':
    'flex items-center gap-[8px] text-[11px] bg-[#f7f9fc] rounded-[6px] p-[12px_10px] text-[#91a3bc] mt-[17px] [&_small]:text-[11px] [&_small]:text-[#718096] [@media(max-width:720px)]:mt-[12px] [@media(max-width:720px)]:p-[10px]',
  'rail-help':
    'p-[24px_13px] text-[#8ea3c2] [&_>_svg]:text-[#a3b6d6] [&_h3]:font-medium [&_h3]:m-[11px_0_7px] [&_h3]:text-[13px] [&_p]:leading-[1.9] [&_p]:text-[#718096] [&_p]:mb-[14px] [&_p]:text-[12px] [&_.button]:text-[#819ac1] [&_.button]:w-full [&_.button]:bg-transparent [&_.button]:border-[#e2e9f3] [&_.button]:text-[11px] [@media(max-width:720px)]:hidden',
  'profile-tabs':
    'flex items-center gap-[30px] [border-bottom:1px_solid_#e3eaf3] h-[42px] mb-[21px] [&_>_button]:h-full [&_>_button]:[border-bottom:2px_solid_transparent] [&_>_button]:text-[12px] [&_>_button]:text-[#93a0b3] [&_>_button]:flex [&_>_button]:items-center [&_>_button]:gap-[6px] [&_>_button]:p-[0_1px] [&_>_button.active]:text-primary [&_>_button.active]:border-[var(--primary)] [&_>_button.active]:font-medium [&_>_button_>_span]:text-[11px] [&_>_button_>_span]:text-[#94a8c7] [&_>_button_>_span]:p-[1px_5px] [&_>_button_>_span]:bg-[#ecf2fc] [&_>_button_>_span]:rounded-[3px] [@media(max-width:720px)]:h-[43px] [@media(max-width:720px)]:mb-[16px]',
  'contact-grid':
    'grid grid-cols-[1fr_1fr] p-[0_21px] [&_>_div]:flex [&_>_div]:gap-[12px] [&_>_div]:p-[22px_0] [&_>_div]:[border-bottom:1px_solid_#f0f3f8] [&_>_div]:min-w-0 [&_>_div:nth-last-child(-n_+_2)]:[border-bottom:0] [&_>_div_>_div]:flex [&_>_div_>_div]:items-start [&_>_div_>_div]:flex-col [&_>_div_>_div]:gap-[6px] [&_>_div_>_div]:min-w-0 [&_small]:text-[#718096] [&_small]:text-[11px] [&_a]:text-[#7b8fae] [&_a]:wrap-anywhere [&_a]:text-[12px] [&_>_div_>_div_>_span:not(.badge)]:text-[#7b8fae] [&_>_div_>_div_>_span:not(.badge)]:wrap-anywhere [&_>_div_>_div_>_span:not(.badge)]:text-[12px] [&_>_div_>_div_>_span.tiny]:text-[11px] [&_>_div_>_div_>_span.tiny]:text-[#abb6c6] [&_.badge]:text-[11px] [&_.badge]:bg-[#f6f8fb] [&_.badge]:text-[#718096] [&_.badge]:border-0 [@media(min-width:1600px)]:[&_>_div]:p-[28px_0] [@media(min-width:1600px)]:[&_a]:text-[13px] [@media(min-width:1600px)]:[&_>_div_>_div_>_span:not(.badge)]:text-[13px] [@media(max-width:1200px)]:p-[0_16px] [@media(max-width:1200px)]:gap-x-[10px] [@media(max-width:1200px)]:[&_>_div]:gap-[8px] [@media(max-width:960px)]:grid-cols-[1fr] [@media(max-width:960px)]:[&_>_div:nth-last-child(2)]:[border-bottom:1px_solid_#f0f3f8] [@media(max-width:960px)]:[&_>_div]:p-[17px_0] [@media(max-width:720px)]:p-[0_15px] [@media(max-width:720px)]:grid-cols-[1fr] [@media(max-width:720px)]:gap-[0] [@media(max-width:720px)]:[&_>_div]:p-[18px_0] [@media(max-width:720px)]:[&_>_div]:gap-[11px] [@media(max-width:720px)]:[&_>_div:nth-last-child(2)]:[border-bottom:1px_solid_#f0f3f8] [@media(max-width:720px)]:[&_a]:text-[12px] [@media(max-width:720px)]:[&_>_div_>_div_>_span:not(.badge)]:text-[12px] [@media(max-width:720px)]:[&_>_div_>_div_>_span.tiny]:text-[11px] [@media(max-width:720px)]:[&_small]:text-[11px] [@media(max-width:960px)]:[&_a]:text-[11px] [@media(max-width:960px)]:[&_>_div_>_div_>_span:not(.badge)]:text-[11px]',
  'contact-icon':
    'w-[33px] h-[33px] grid place-items-center bg-[#f4f7fc] text-[#86a1ce] [border:1px_solid_#eaf0f9] rounded-[8px] [@media(max-width:1200px)]:w-[28px] [@media(max-width:1200px)]:h-[28px] [@media(max-width:1200px)]:[&_svg]:w-[15px] [@media(max-width:720px)]:w-[31px] [@media(max-width:720px)]:h-[32px] [@media(max-width:720px)]:[&_svg]:w-[14px]',
  'overview-body':
    'p-[22px] [&_h3]:text-[13px] [&_h3]:text-[#7186a3] [&_h3]:font-medium [&_>_p]:leading-[1.9] [&_>_p]:text-[#718096] [&_>_p]:mt-[10px] [&_>_p]:text-[12px] [@media(min-width:1600px)]:[&_>_p]:text-[13px] [@media(max-width:1200px)]:p-[18px] [@media(max-width:960px)]:[&_>_p]:text-[12px] [@media(max-width:720px)]:p-[17px] [@media(max-width:720px)]:[&_h3]:text-[12px] [@media(max-width:720px)]:[&_>_p]:text-[12px]',
  'overview-facts':
    'grid grid-cols-[repeat(3,_minmax(0,_1fr))] gap-[18px] pt-[20px] mt-[20px] [border-top:1px_solid_#eff3f8] [&_small]:block [&_small]:text-[#718096] [&_small]:mb-[6px] [&_small]:text-[11px] [&_strong]:font-medium [&_strong]:text-[#8093af] [&_strong]:text-[12px] [@media(min-width:1600px)]:[&_strong]:text-[12px] [@media(max-width:1200px)]:grid-cols-[1fr_1fr] [@media(max-width:720px)]:gap-[15px] [@media(max-width:720px)]:[&_strong]:text-[11px] [@media(max-width:720px)]:[&_small]:text-[10px]',
  'current-company':
    'p-[22px] [&_>_p]:text-[12px] [&_>_p]:text-[#718096] [&_>_p]:leading-[1.9] [&_>_p]:m-[16px_0_13px]',
  'notes-body':
    'p-[22px] [&_>_label]:block [&_>_label]:text-[12px] [&_>_label]:text-[#8497b4] [&_>_label]:mb-[12px] [&_textarea]:w-full [&_textarea]:[border:1px_solid_#e2eaf5] [&_textarea]:rounded-[6px] [&_textarea]:resize-y [&_textarea]:p-[14px] [&_textarea]:text-[12px] [&_textarea]:text-[#6e83a3] [&_textarea]:leading-[1.8] [&_textarea::placeholder]:text-[#acb8c9] [&_>_div]:flex [&_>_div]:justify-between [&_>_div]:items-center [&_>_div]:mt-[15px] [&_>_div]:text-[11px] [&_>_div]:text-[#718096]',
  'settings-profile':
    'flex items-center gap-[12px] [border:1px_solid_var(--line)] rounded-[7px] p-[15px] [&_>_div]:flex-1 [&_strong]:block [&_strong]:text-[12px] [&_strong]:text-[#738aa9] [&_small]:block [&_small]:text-[11px] [&_small]:text-[#718096] [&_small]:mt-[3px]',
  'settings-facts':
    '[&_.fact]:flex [&_.fact]:items-center [&_.fact]:justify-between [&_.fact]:p-[12px_0] [&_dt]:m-0',
  toast:
    'fixed bottom-[25px] left-[calc(50%_+_85px)] [transform:translateX(-50%)] z-[100] flex items-center gap-[10px] bg-white [border:1px_solid_#dfe8f1] shadow-[0_6px_35px_#18345722] p-[14px_17px] rounded-[8px] text-[12px] max-w-[calc(100vw_-_32px)] [&_>_svg]:text-[#4b9c7d] [&_button]:flex [&_button]:text-[#9da8b9] [&_button]:ml-[8px] [&_button]:p-[3px] [@media(max-width:720px)]:left-[50%] [@media(max-width:720px)]:w-[max-content] [@media(max-width:720px)]:max-w-[calc(100vw_-_30px)] [@media(max-width:720px)]:bottom-[15px] [@media(max-width:720px)]:text-[12px] [@media(max-width:720px)]:gap-[8px]',
  'modal-backdrop':
    'fixed inset-0 z-[70] flex items-center justify-center p-[25px] backdrop-blur-[3px] inset-[0] bg-[#192c4857] [backdrop-filter:blur(3px)] [@media(max-width:720px)]:p-[17px]',
  modal:
    'w-[480px] max-w-full bg-white [border:1px_solid_#e4eaf2] rounded-[14px] p-[25px] shadow-[0_20px_90px_#182b4633] max-h-[90vh] overflow-y-auto [&_h2]:text-[20px] [&_h2]:tracking-[-0.5px] [&_h2]:leading-[1.4] [&_h2]:mb-[10px] [&_>_p]:text-[12px] [&_>_p]:leading-[1.9] [&_>_p]:text-[#718096] [&_>_p]:mb-[23px] [@media(max-width:720px)]:p-[23px_20px] [@media(max-width:720px)]:rounded-[11px] [@media(max-width:720px)]:max-h-[calc(100dvh_-_35px)] [@media(max-width:720px)]:[&_h2]:text-[19px] [@media(max-width:720px)]:[&_>_p]:text-[12px]',
  'modal-heading': 'flex items-center justify-between mb-[20px]',
  'modal-icon':
    'grid place-items-center w-[43px] h-[43px] [border:1px_solid_#dfe8fa] bg-[#f1f5fe] rounded-[11px] text-[#7093d1]',
  'field-label':
    'text-[12px] font-medium text-[#7d8fa8] block m-[20px_0_15px] [&_span]:font-normal [&_span]:text-[#718096] [&_input]:block [&_input]:w-full [&_input]:[border:1px_solid_#e0e7f1] [&_input]:rounded-[6px] [&_input]:p-[11px] [&_input]:mt-[8px] [&_input]:text-[12px] [&_input]:font-normal [&_input]:resize-y [&_input]:text-[#6e83a3] [&_textarea]:block [&_textarea]:w-full [&_textarea]:[border:1px_solid_#e0e7f1] [&_textarea]:rounded-[6px] [&_textarea]:p-[11px] [&_textarea]:mt-[8px] [&_textarea]:text-[12px] [&_textarea]:font-normal [&_textarea]:resize-y [&_textarea]:text-[#6e83a3] [&_input::placeholder]:text-[#acb8ca] [&_textarea::placeholder]:text-[#acb8ca]',
  'existing-lists':
    '[border-top:1px_solid_var(--line)] pt-[20px] mt-[22px] [&_h3]:text-[12px] [&_h3]:text-[#8fa0b9] [&_h3]:mb-[9px] [&_>_button]:flex [&_>_button]:items-center [&_>_button]:gap-[10px] [&_>_button]:p-[10px_0] [&_>_button]:w-full [&_>_button]:text-left [&_>_button]:text-[#8198bc] [&_>_button_>_span]:flex-1 [&_>_button_>_span]:text-[12px] [&_small]:block [&_small]:text-[#718096] [&_small]:text-[11px] [&_small]:mt-[2px]',
  'request-options':
    'grid grid-cols-[1fr_1fr] gap-[10px] [&_label]:flex [&_label]:items-center [&_label]:gap-[9px] [&_label]:bg-[#fbfcfe] [&_label]:[border:1px_solid_#e6ecf5] [&_label]:rounded-[6px] [&_label]:p-[11px] [&_label]:text-[12px] [&_label]:text-[#8499b9] [@media(max-width:720px)]:gap-[8px] [@media(max-width:720px)]:[&_label]:p-[10px] [@media(max-width:720px)]:[&_label]:text-[11px]',
  'inline-info':
    'flex items-start gap-[8px] bg-[#f6f9fe] [border:1px_solid_#e7edf8] rounded-[6px] p-[12px] text-[12px] text-[#718096] leading-[1.8] m-[18px_0] [&_>_svg]:mt-[2px] [&_>_svg]:text-[#9bb3d9]',
  'modal-search':
    'flex gap-[10px] items-center p-[12px] [border:1px_solid_#dfe7f3] rounded-[7px] mt-[23px] text-[#9aadc8] [&_>_input]:border-0 [&_>_input]:[outline:none] [&_>_input]:text-[12px] [&_>_input]:w-full [&_>_input]:text-[#7189ac] [&_>_input:focus]:[outline:none]',
  'global-results':
    'mt-[15px] [&_>_a]:flex [&_>_a]:items-center [&_>_a]:justify-between [&_>_a]:p-[10px_7px] [&_>_a]:rounded-[7px] [&_>_a]:text-[#9eb2cf] [&_>_a:hover]:bg-[#f7faff] [&_>_p]:p-[15px_0] [&_>_p]:text-[12px]',
  'upload-zone':
    'flex items-center justify-center flex-col gap-[10px] bg-[#f9fbff] [border:1px_dashed_#cddcf5] rounded-[8px] p-[30px_15px] cursor-pointer text-[#8aa6d2] text-center [&_strong]:text-[12px] [&_strong]:font-medium [&_small]:text-[11px] [&_small]:text-[#718096] [&_input]:text-[12px] [&_input]:w-full [&_input]:max-w-[260px] [&_input]:text-[#879fc3]',
  'csv-preview':
    'bg-[#f6f9fd] rounded-[6px] [border:1px_solid_#e7edf5] p-[14px] text-[#899fbc] text-[11px] overflow-x-auto mt-[14px]',
  'error-text': 'text-[#c56e79]! mt-[12px]!',
  'notification-item':
    'p-[15px_0_25px] flex gap-[13px] [&_strong]:text-[12px] [&_strong]:text-[#6c85a9] [&_p]:text-[12px] [&_p]:leading-[1.9] [&_p]:mt-[5px] [&_p]:text-[#718096] [&_small]:text-[11px] [&_small]:text-[#718096] [&_small]:block [&_small]:mt-[10px]',
  'help-items':
    '[&_>_div]:flex [&_>_div]:items-start [&_>_div]:gap-[12px] [&_>_div]:m-[23px_0] [&_strong]:text-[12px] [&_strong]:text-[#7c96b9] [&_p]:text-[12px] [&_p]:leading-[1.9] [&_p]:text-[#718096] [&_p]:mt-[5px]',
  'campaign-preview':
    'p-[28px_18px] bg-[#f7faff] [border:1px_solid_#e4edfa] rounded-[8px] text-center text-[#93acd0] m-[20px_0] [&_>_svg]:m-[0_auto_17px] [&_h3]:text-[13px] [&_h3]:text-[#859ec1] [&_h3]:mb-[9px] [&_p]:text-[12px] [&_p]:leading-[1.9] [&_p]:text-[#718096]',
  'existing-list-row':
    'flex items-center gap-[10px] [border-bottom:1px_solid_var(--line)] [&_>_button:first-child]:flex [&_>_button:first-child]:items-center [&_>_button:first-child]:gap-[10px] [&_>_button:first-child]:p-[13px_0] [&_>_button:first-child]:flex-1 [&_>_button:first-child]:min-w-0 [&_>_button:first-child]:text-left [&_>_button:first-child]:text-[#6984ae] [&_>_button:first-child_>_span]:flex-1 [&_>_button:first-child_>_span]:text-[12px] [&_small]:block [&_small]:text-[11px] [&_small]:text-[#718096] [&_small]:mt-[3px] [&_>_.button]:text-[11px] [@media(max-width:720px)]:[&_.button]:text-[10px]',
  'contact-preview':
    'flex items-center gap-[13px] p-[20px] bg-[#f7faff] [border:1px_solid_#e4edfa] rounded-[7px] text-[#6c8bbd] [&_small]:block [&_small]:text-[11px] [&_small]:mb-[5px] [&_small]:text-[#718096] [&_a]:text-[13px] [&_a]:text-[#245be3] [&_a]:wrap-anywhere',
  'directory-workspace':
    'h-[100dvh] min-h-0 overflow-hidden [&_.app-content]:h-full [&_.app-content]:flex [&_.app-content]:flex-col [&_.topbar]:shrink-0 [&_main]:flex-1 [&_main]:min-h-0 [&_main]:overflow-hidden [&_.directory-page]:h-full [&_.directory-page]:max-w-[none] [&_.directory-page]:p-[24px_24px_10px] [&_.directory-page]:flex [&_.directory-page]:flex-col [&_.directory-page]:min-h-0 [&_.page-heading]:flex-none [&_.page-heading]:mb-[18px] [&_.page-heading_h1]:text-[23px] [&_.directory-search-form]:flex-none [&_.directory-search-form]:mb-[18px] [&_.directory-discovery-layout]:flex-1 [&_.directory-discovery-layout]:min-h-0 [&_.directory-discovery-layout]:grid-rows-[minmax(0,_1fr)] [&_.directory-discovery-layout]:items-stretch [&_.directory-discovery-layout]:gap-[0] [&_.directory-discovery-layout]:[border:1px_solid_#dfe3e8] [&_.directory-discovery-layout]:rounded-[8px] [&_.directory-discovery-layout]:overflow-hidden [&_.directory-discovery-layout]:bg-white [&_.directory-discovery-layout.with-filters]:grid-cols-[300px_minmax(0,_1fr)] [&_.directory-shell]:flex [&_.directory-shell]:flex-col [&_.directory-shell]:min-h-0 [&_.directory-shell]:border-0 [&_.directory-shell]:rounded-[0] [&_.directory-page_.results-heading]:flex-none [&_.directory-page_.results-heading]:min-h-[44px] [&_.directory-page_.results-heading]:p-[10px_16px] [&_.directory-page_.results-heading]:text-[11px] [&_.directory-page_.results-heading]:[border-bottom:1px_solid_#e6e8eb] [&_.directory-page_.record-grid]:flex-1 [&_.directory-page_.record-grid]:min-h-0 [&_.directory-page_.record-grid]:overflow-auto [&_.directory-page_.record-grid]:overscroll-contain [&_.directory-page_.record-grid]:[scrollbar-gutter:auto] [&_.apollo-filter-panel]:min-h-0 [&_.apollo-filter-panel]:min-w-0 [&_.apollo-filter-panel]:overflow-hidden [&_.apollo-filter-panel]:border-0 [&_.apollo-filter-panel]:[border-right:1px_solid_#dfe3e8] [&_.apollo-filter-panel]:rounded-[0] [&_.apollo-filter-panel]:flex [&_.apollo-filter-panel]:flex-col [&_.apollo-filter-panel_>_header]:flex-none [&_.apollo-filter-panel_>_form]:flex-1 [&_.apollo-filter-panel_>_form]:min-h-0 [&_.apollo-filter-panel_>_form]:overflow-hidden [&_.apollo-filter-panel_>_form]:flex [&_.apollo-filter-panel_>_form]:flex-col [&_.apollo-filter-groups]:[flex:1_1_0] [&_.apollo-filter-groups]:overflow-x-hidden [&_.apollo-filter-groups]:overflow-y-auto [&_.apollo-filter-groups]:min-h-0 [&_.apollo-filter-groups]:overscroll-contain [&_.apollo-filter-groups]:[scrollbar-gutter:auto] [&_.apollo-filter-groups]:[touch-action:pan-y] [&_.apollo-filter-groups:focus-visible]:[outline:2px_solid_var(--primary)] [&_.apollo-filter-groups:focus-visible]:[outline-offset:-2px] [&_.apollo-filter-panel_footer]:flex-none [&_.apollo-filter-panel_footer]:[border-top:1px_solid_#e5e7eb] [&_.pagination]:flex-none [&_.pagination]:min-h-[48px] [&_.pagination]:p-[8px_16px] [&_.pagination]:bg-white [&_.pagination]:[border-top:1px_solid_#e5e7eb] [&_.data-disclaimer]:flex-none [&_.data-disclaimer]:text-[10px] [&_.data-disclaimer]:p-[8px_0_0] [&_.data-disclaimer]:m-0 [@media(max-width:720px)]:[&_.directory-page]:p-[16px_12px_8px] [@media(max-width:720px)]:[&_.page-heading]:mb-[12px] [@media(max-width:720px)]:[&_.page-heading_p]:hidden [@media(max-width:720px)]:[&_.directory-search-form]:mb-[12px] [@media(max-width:720px)]:[&_.directory-discovery-layout]:relative [@media(max-width:720px)]:[&_.directory-discovery-layout.with-filters]:grid-cols-[minmax(0,_1fr)] [@media(max-width:720px)]:[&_.apollo-filter-panel]:absolute [@media(max-width:720px)]:[&_.apollo-filter-panel]:inset-[0_auto_0_0] [@media(max-width:720px)]:[&_.apollo-filter-panel]:w-[min(300px,_90%)] [@media(max-width:720px)]:[&_.apollo-filter-panel]:z-[12] [@media(max-width:720px)]:[&_.apollo-filter-panel]:shadow-[8px_0_20px_#19283c18] [@media(max-width:720px)]:[&_.data-disclaimer]:text-[9px]',
  'record-grid':
    "[&_table]:[table-layout:fixed] [&_table]:w-full [&_table]:min-w-[1160px] [&_table]:border-separate [&_table]:[border-spacing:0] [&_table]:text-[12px] [&_table]:text-[#303741] [&_.record-check-col]:w-[38px] [&_th]:sticky [&_th]:top-[0] [&_th]:z-[3] [&_th]:h-[39px] [&_th]:p-[0_12px] [&_th]:bg-[#f8f9fa] [&_th]:text-[#5b626c] [&_th]:[border-bottom:1px_solid_#e2e5e9] [&_th]:text-[10px] [&_th]:uppercase [&_th]:font-medium [&_th]:tracking-[0.25px] [&_th:hover_svg]:opacity-[1] [&_td]:p-[10px_12px] [&_td]:h-[55px] [&_td]:[border-bottom:1px_solid_#e8eaed] [&_td]:bg-white [&_tbody_tr:last-child_td]:[border-bottom:1px_solid_#e8eaed] [&_tbody_tr:hover_td]:bg-[#f7f9fc] [&_tbody_tr.record-selected_td]:bg-[#edf4ff] [&_.record-checkbox]:sticky [&_.record-checkbox]:left-[0] [&_.record-checkbox]:z-[2] [&_.record-checkbox]:p-[0_10px] [&_th.record-checkbox]:z-[5] [&_.record-name-cell]:sticky [&_.record-name-cell]:left-[38px] [&_.record-name-cell]:z-[2] [&_.record-name-cell]:[border-right:1px_solid_#e8eaed] [&_th:nth-child(2)]:sticky [&_th:nth-child(2)]:left-[38px] [&_th:nth-child(2)]:z-[5] [&_th:nth-child(2)]:[border-right:1px_solid_#e8eaed] [&_input[type='checkbox']]:w-[14px] [&_input[type='checkbox']]:h-[14px] [&_input[type='checkbox']]:align-middle [&_input[type='checkbox']]:cursor-pointer [&_input[type='checkbox']]:[accent-color:var(--primary)] [&_.company-logo]:w-[27px] [&_.company-logo]:h-[27px] [&_.company-logo]:text-[14px] [&_.company-logo]:rounded-[5px] [&_.company-logo]:flex-none [&:focus-visible]:[outline:2px_solid_var(--primary)] [&:focus-visible]:[outline-offset:-2px] [&_a:focus-visible]:[outline:2px_solid_var(--primary)] [&_a:focus-visible]:[outline-offset:-2px] [&_button:focus-visible]:[outline:2px_solid_var(--primary)] [&_button:focus-visible]:[outline-offset:-2px] [@media(max-width:720px)]:[&_.record-name-cell]:static [@media(max-width:720px)]:[&_th:nth-child(2)]:static",
  'buyer-grid':
    '[&_.record-col-0]:w-[250px] [&_.record-col-1]:w-[105px] [&_.record-col-2]:w-[80px] [&_.record-col-3]:w-[155px] [&_.record-col-4]:w-[170px] [&_.record-col-5]:w-[180px] [&_.record-col-6]:w-[200px]',
  'people-grid':
    '[&_.record-col-0]:w-[215px] [&_.record-col-1]:w-[220px] [&_.record-col-2]:w-[230px] [&_.record-col-3]:w-[170px] [&_.record-col-4]:w-[170px] [&_.record-col-5]:w-[145px]',
  'record-column-label':
    'flex items-center justify-between gap-[6px] [&_svg]:opacity-[0] [&_svg]:flex-none',
  'record-tooltip-anchor': 'inline-flex align-middle min-w-0 max-w-full',
  'record-name':
    'flex items-center gap-[9px] min-w-0 max-w-full font-medium text-[12px] [&_>_span]:overflow-hidden [&_>_span]:[text-overflow:ellipsis] [&_>_span]:underline [&_>_span]:underline-offset-[2px] [&:hover]:text-primary',
  'record-employer':
    'flex items-center gap-[9px] min-w-0 max-w-full font-medium text-[12px] [&:hover]:text-primary [&_.company-logo]:w-[21px] [&_.company-logo]:h-[21px] [&_.company-logo]:text-[11px] [&_>_span:last-child]:overflow-hidden [&_>_span:last-child]:[text-overflow:ellipsis]',
  'record-truncate': 'block overflow-hidden [text-overflow:ellipsis] whitespace-nowrap',
  'record-actions': 'flex items-center gap-[8px]',
  'record-links': 'flex items-center gap-[8px]',
  'record-save':
    'inline-flex items-center justify-center gap-[6px] [border:1px_solid_#d9dde3] bg-white text-[#353e49] text-[12px] font-medium rounded-[6px] p-[6px_9px] whitespace-nowrap leading-[1.3] [&:hover]:bg-[#f3f5f8] [&:hover]:border-[#a8b3c0] [&.saved]:text-[#246447] [&.saved]:bg-[#f0faf4]',
  'record-contact':
    'inline-flex items-center justify-center gap-[6px] [border:1px_solid_#d9dde3] bg-white text-[#353e49] text-[12px] font-medium rounded-[6px] p-[6px_9px] whitespace-nowrap leading-[1.3] [&:hover]:bg-[#f3f5f8] [&:hover]:border-[#a8b3c0]',
  'record-icon-link':
    'inline-flex items-center justify-center w-[25px] h-[27px] rounded-[4px] text-[#68717e] [&:hover]:text-primary [&:hover]:bg-[#edf3ff]',
  'record-contact-icon': 'relative inline-flex',
  'contact-status':
    'absolute top-[-4px] right-[-4px] bg-white rounded-[50%] text-[#818b98] [&.available]:text-[#1da979]',
  'record-employee-count':
    'inline-block bg-[#f0f1f3] text-[#4d555e] p-[2px_7px] text-[11px] rounded-[10px] leading-[1.5]',
  'record-pill':
    'inline-block bg-[#f0f1f3] text-[#4d555e] p-[2px_7px] text-[11px] rounded-[10px] leading-[1.5]',
  'record-tag-button':
    'inline-flex items-center gap-[5px] max-w-full text-left [&_.record-pill:first-child]:overflow-hidden [&_.record-pill:first-child]:[text-overflow:ellipsis] [&_.record-pill:first-child]:whitespace-nowrap [&_.record-pill:first-child]:max-w-[124px] [&:hover_.record-pill]:bg-[#e3e7ed] [&_>_svg]:flex-none',
  'record-more': 'flex-none',
  'record-tooltip':
    'fixed z-[150] max-w-[min(250px,_90vw)] p-[7px_10px] bg-[#22272e] text-white rounded-[5px] text-[11px] leading-[1.5] text-center shadow-[0_3px_12px_#0002] pointer-events-none [transform:translateX(-50%)] wrap-anywhere [&.above]:[transform:translate(-50%,_-100%)]',
  'record-modal-backdrop':
    'fixed inset-[0] z-[100] bg-[#161c2880] grid place-items-center p-[20px]',
  'record-tags-modal':
    'w-[min(480px,_100%)] h-[min(400px,_85dvh)] bg-white [border:1px_solid_#dfe3e8] rounded-[8px] shadow-[0_16px_60px_#15213633] flex flex-col [&_>_header]:flex [&_>_header]:items-center [&_>_header]:gap-[8px] [&_>_header]:p-[16px_20px] [&_.company-logo]:w-[24px] [&_.company-logo]:h-[24px] [&_.company-logo]:text-[12px] [&_.company-logo]:rounded-[5px] [&_.company-logo]:flex-none [&_h2]:text-[14px] [&_h2]:font-semibold [&_h2]:overflow-hidden [&_h2]:whitespace-nowrap [&_h2]:[text-overflow:ellipsis] [&_h2]:flex-1 [&_>_footer]:[border-top:1px_solid_#e7e9ed] [&_>_footer]:p-[16px_20px] [&_>_footer]:flex [&_>_footer]:justify-end',
  'record-modal-tags':
    'flex-1 min-h-0 overflow-y-auto p-[12px_20px_24px] flex flex-wrap [align-content:flex-start] gap-[5px]',
  'record-profile-page':
    'min-h-[calc(100dvh_-_65px)] flex flex-col bg-[#f8f9fb] [&_button:focus-visible]:[outline:2px_solid_var(--primary)] [&_button:focus-visible]:[outline-offset:2px] [&_a:focus-visible]:[outline:2px_solid_var(--primary)] [&_a:focus-visible]:[outline-offset:2px] [&_summary:focus-visible]:[outline:2px_solid_var(--primary)] [&_summary:focus-visible]:[outline-offset:2px]',
  'record-profile-header':
    'flex-none bg-white [border-bottom:1px_solid_#e1e5ea] p-[16px_24px_20px] [@media(max-width:640px)]:p-[12px_16px]',
  'detail-breadcrumb':
    'flex gap-[9px] items-center text-[#687383] text-[11px] mb-[19px] [&_>_span]:text-[#303846] [&_>_span]:whitespace-nowrap [&_>_span]:overflow-hidden [&_>_span]:[text-overflow:ellipsis] [&_>_a:hover]:underline [@media(max-width:640px)]:mb-[12px]',
  'record-profile-heading':
    'flex items-center justify-between gap-[20px] [@media(max-width:900px)]:items-start [@media(max-width:900px)]:flex-col [@media(max-width:900px)]:gap-[14px]',
  'detail-identity':
    'flex items-center gap-[13px] min-w-0 [&_>_.company-logo]:w-[43px] [&_>_.company-logo]:h-[43px] [&_>_.company-logo]:text-[21px] [&_>_.company-logo]:rounded-[8px] [&_>_.company-logo]:flex-none [&_>_.person-avatar]:w-[43px] [&_>_.person-avatar]:h-[43px] [&_>_.person-avatar]:text-[21px] [&_>_.person-avatar]:rounded-[8px] [&_>_.person-avatar]:flex-none [&_>_div]:min-w-0 [&_p]:flex [&_p]:items-center [&_p]:flex-wrap [&_p]:gap-[5px] [&_p]:text-[12px] [&_p]:text-[#687383] [&_p]:mt-[7px] [&_p]:leading-[1.7] [&_p_a]:underline [&_p_a]:underline-offset-[2px] [&_p_a]:text-[#465263]',
  'detail-title-row':
    'flex items-center gap-[12px] [&_h1]:text-[21px] [&_h1]:font-semibold [&_h1]:tracking-[-0.5px] [&_h1]:text-[#202a36] [&_h1]:m-0 [&_a]:text-[#758192] [&_a]:flex-none [@media(max-width:1200px)]:[&_h1]:text-[19px] [@media(max-width:640px)]:[&_h1]:text-[18px]',
  'detail-meta-divider': 'p-[0_4px]',
  'detail-header-actions':
    'flex items-center gap-[8px] flex-none [&_.button]:p-[8px_11px] [&_.button]:min-h-[33px] [&_.button]:text-[12px] [@media(max-width:640px)]:flex-wrap',
  'detail-square-button':
    'inline-grid place-items-center w-[33px] h-[33px] [border:1px_solid_#dce1e8] rounded-[6px] text-[#596677] bg-white [&:hover]:bg-[#f3f5f8]',
  'record-profile-layout':
    'grid grid-cols-[320px_minmax(0,_1fr)] items-start flex-1 min-h-0 [@media(max-width:1200px)]:grid-cols-[290px_minmax(0,_1fr)] [@media(max-width:640px)]:block',
  'record-profile-rail':
    'min-w-0 p-[20px_16px_24px] [border-right:1px_solid_#dfe4e9] min-h-0 [@media(max-width:900px)]:p-[16px_10px] [@media(max-width:640px)]:overflow-visible [@media(max-width:640px)]:border-0 [@media(max-width:640px)]:pb-[0]',
  'record-profile-main':
    'p-[18px_22px_24px] min-w-0 min-h-0 [@media(max-width:900px)]:p-[16px_12px] [@media(max-width:640px)]:overflow-visible [@media(max-width:640px)]:border-0',
  'detail-card':
    '[border:1px_solid_#e0e4ea] rounded-[9px] bg-white mb-[18px] overflow-hidden [&_>_header]:flex [&_>_header]:items-center [&_>_header]:gap-[9px] [&_>_header]:p-[17px_18px] [&_>_header]:min-h-[51px] [&_>_header]:text-[#364253] [&_>_summary]:flex [&_>_summary]:items-center [&_>_summary]:gap-[9px] [&_>_summary]:p-[17px_18px] [&_>_summary]:min-h-[51px] [&_>_summary]:text-[#364253] [&_>_summary]:list-none [&_>_summary]:cursor-pointer [&_>_header_>_h2]:text-[13px] [&_>_header_>_h2]:font-semibold [&_>_header_>_h2]:flex-1 [&_>_header_>_h2]:m-0 [&_>_summary_>_span]:text-[13px] [&_>_summary_>_span]:font-semibold [&_>_summary_>_span]:flex-1 [&_>_summary_>_span]:m-0 [&_>_header_>_svg]:text-[#98a1ad] [&_>_header_>_svg]:flex-none [&_>_summary_>_svg:first-child]:text-[#98a1ad] [&_>_summary_>_svg:first-child]:flex-none [&_>_header_.company-logo]:w-[23px] [&_>_header_.company-logo]:h-[23px] [&_>_header_.company-logo]:text-[12px] [&_>_header_.company-logo]:flex-none [&_>_summary::-webkit-details-marker]:hidden [&:not([open])_>_summary_>_svg:last-child]:[transform:rotate(180deg)] [@media(max-width:640px)]:mb-[12px]',
  'detail-rail-body': 'p-[0_17px_20px]',
  'detail-description': 'text-[12px] leading-[1.85] text-[#5c6877] m-[0_0_20px]',
  'detail-facts':
    'm-0 [&_>_div]:grid [&_>_div]:grid-cols-[95px_minmax(0,_1fr)] [&_>_div]:items-start [&_>_div]:gap-[10px] [&_>_div]:p-[11px_0] [&_>_div]:text-[11px] [&_>_div]:leading-[1.7] [&_dt]:text-[#84909e] [&_dd]:flex [&_dd]:gap-[5px] [&_dd]:items-center [&_dd]:text-[#3d4958] [&_dd]:m-0 [&_dd]:min-w-0 [&_dd]:wrap-anywhere [&_dd_>_svg]:flex-none [&_a]:text-[#42618c] [&_.detail-pills]:flex [&_.detail-pills]:flex-wrap [&_.detail-pills]:gap-[5px]',
  'detail-inline-link': 'inline-flex items-center gap-[5px]',
  'detail-icon-link': 'inline-flex p-[3px]',
  'detail-contact-list':
    'p-[9px_17px_19px] grid gap-[21px] [&_>_div]:flex [&_>_div]:items-start [&_>_div]:gap-[11px] [&_>_div_>_div]:min-w-0 [&_>_div_>_div]:grid [&_>_div_>_div]:gap-[5px] [&_>_div_>_div]:text-[11px] [&_a]:wrap-anywhere [&_a]:text-[#405675] [&_small]:text-[#8b95a3] [&_small]:text-[10px]',
  'detail-contact-symbol':
    '[border:1px_solid_#edf0f3] bg-[#f7f9fb] text-[#728093] w-[30px] h-[30px] grid place-items-center rounded-[50%] flex-none',
  'detail-sample': 'inline-flex items-center gap-[4px] text-[9px] text-[#8793a2]',
  'detail-muted': 'text-[#7c8795]',
  'detail-access-button':
    'inline-flex justify-center items-center gap-[7px] [border:1px_solid_#dce3ed] rounded-[5px] p-[8px_9px] text-[11px] text-[#45576f] bg-[#fbfcfe]',
  'detail-text-button': 'inline-flex items-center gap-[5px] text-primary text-[11px] text-left',
  'detail-section-tabs':
    'flex items-center gap-[3px] bg-[#edf0f4] [border:1px_solid_#e1e5eb] rounded-[7px] p-[3px] mb-[18px] w-[fit-content] max-w-full overflow-x-auto [&_button]:inline-flex [&_button]:items-center [&_button]:justify-center [&_button]:gap-[7px] [&_button]:p-[7px_14px] [&_button]:rounded-[5px] [&_button]:text-[12px] [&_button]:text-[#647182] [&_button]:whitespace-nowrap [&_button.active]:bg-white [&_button.active]:text-[#253143] [&_button.active]:shadow-[0_1px_3px_#1b2d4414] [&_button.active]:font-[550] [&_button_>_span]:text-[10px] [&_button_>_span]:text-[#8794a4] [@media(max-width:640px)]:w-full [@media(max-width:640px)]:[&_button]:p-[7px_10px]',
  'detail-card-tabs':
    'flex p-[0_18px] [border-bottom:1px_solid_#e9edf2] gap-[20px] [&_>_span]:p-[8px_0_12px] [&_>_span]:text-[11px] [&_>_.active]:[border-bottom:2px_solid_#52657e] [&_>_.active]:text-[#364457] [&_>_.active]:font-semibold',
  'detail-demo-label': 'text-[#95a0ae] text-[10px]',
  'detail-insights':
    'grid grid-cols-[minmax(0,_1.2fr)_minmax(190px,_1fr)] gap-[24px] p-[22px_18px] [&_dl]:m-0 [&_dl_>_div]:grid [&_dl_>_div]:grid-cols-[140px_minmax(0,_1fr)] [&_dl_>_div]:gap-[10px] [&_dl_>_div]:items-start [&_dl_>_div]:p-[12px_0] [&_dl_>_div]:text-[11px] [&_dt]:flex [&_dt]:items-center [&_dt]:gap-[7px] [&_dt]:text-[#8b96a5] [&_dd]:m-0 [&_dd]:text-[#3d4a5c] [@media(max-width:1200px)]:grid-cols-[1fr] [@media(max-width:900px)]:[&_dl_>_div]:grid-cols-[110px_minmax(0,_1fr)] [@media(max-width:640px)]:[&_dl_>_div]:grid-cols-[120px_minmax(0,_1fr)]',
  'detail-pills': 'flex flex-wrap gap-[5px]',
  'detail-insight-note':
    '[border-left:1px_solid_#edf0f4] p-[2px_0_0_22px] flex flex-col items-start gap-[9px] [&_strong]:text-[12px] [&_strong]:font-semibold [&_p]:text-[11px] [&_p]:leading-[1.8] [&_p]:text-[#8390a1] [&_p]:m-0 [&_a]:inline-flex [&_a]:items-center [&_a]:gap-[5px] [&_a]:text-[11px] [&_a]:text-primary [&_a]:mt-[4px] [&_button]:inline-flex [&_button]:items-center [&_button]:gap-[5px] [&_button]:text-[11px] [&_button]:text-primary [&_button]:mt-[4px] [@media(max-width:1200px)]:[border-left:0] [@media(max-width:1200px)]:[border-top:1px_solid_#edf0f4] [@media(max-width:1200px)]:p-[18px_0_0]',
  'detail-insight-icon':
    'bg-[#f0f4fb] text-[#7b95b8] grid place-items-center w-[41px] h-[41px] rounded-[9px]',
  'detail-about':
    'p-[16px_18px_22px] [&_>_p]:text-[#637183] [&_>_p]:text-[12px] [&_>_p]:leading-[1.9] [&_>_p]:mb-[16px] [&.detail-facts_>_div]:grid-cols-[160px_minmax(0,_1fr)] [&.detail-facts_>_div]:[border-bottom:1px_solid_#f0f2f5] [&.detail-facts_>_div]:p-[13px_0] [&_.detail-facts]:grid [&_.detail-facts]:grid-cols-[1fr_1fr] [&_.detail-facts]:gap-[0_24px] [@media(max-width:1200px)]:[&_.detail-facts]:grid-cols-[1fr]',
  'detail-people-card':
    '[&_.record-grid]:overflow-auto [&_.record-grid_table]:min-w-[1188px] [&_.empty-state]:p-[35px_20px]',
  'detail-location-card':
    'flex gap-[16px] items-center p-[24px_20px] [border-top:1px_solid_#edf0f4] [&_>_span]:bg-[#f0f5fd] [&_>_span]:text-[#6a8ab7] [&_>_span]:w-[55px] [&_>_span]:h-[55px] [&_>_span]:grid [&_>_span]:place-items-center [&_>_span]:rounded-[10px] [&_small]:text-[#95a1b0] [&_small]:text-[9px] [&_small]:tracking-[1px] [&_h3]:text-[16px] [&_h3]:m-[5px_0] [&_p]:text-[#7b8797] [&_p]:text-[12px]',
  'detail-notes':
    'p-[12px_18px_20px] grid gap-[12px] [&_label]:text-[12px] [&_label]:text-[#68788b] [&_textarea]:w-full [&_textarea]:resize-y [&_textarea]:min-h-[150px] [&_textarea]:[border:1px_solid_#dde4ed] [&_textarea]:rounded-[7px] [&_textarea]:p-[14px] [&_textarea]:text-[12px] [&_textarea]:leading-[1.8] [&_footer]:flex [&_footer]:items-center [&_footer]:justify-between [&_footer]:gap-[12px] [&_small]:text-[#909caa] [&_small]:text-[10px]',
  'detail-profile-disclaimer': 'text-[10px] text-[#99a3b0] flex items-center gap-[6px]',
  'enrichment-page':
    'max-w-[1540px] m-[0_auto] p-[30px_32px_48px] [&_a:hover]:text-primary [&_button:focus-visible]:[outline:2px_solid_var(--primary)] [&_button:focus-visible]:[outline-offset:3px] [&_a:focus-visible]:[outline:2px_solid_var(--primary)] [&_a:focus-visible]:[outline-offset:3px] [@media(max-width:800px)]:p-[22px_18px_35px]',
  'enrich-page-heading':
    'flex justify-between items-center mb-[25px] gap-[20px] [&_h1]:text-[27px] [&_h1]:tracking-[-0.8px] [&_h1]:font-[650] [&_h1]:leading-[1.3] [&_p]:text-[12px] [&_p]:text-[#8a94a3] [&_p]:mt-[8px] [@media(max-width:540px)]:items-start [@media(max-width:540px)]:[&_h1]:text-[24px]',
  'enrich-eyebrow':
    'flex items-center gap-[6px] text-[#8294b3] text-[9px] font-semibold tracking-[1.4px] mb-[9px]',
  'enrich-demo-badge':
    'inline-flex items-center gap-[7px] [border:1px_solid_#e1e8f0] rounded-[20px] bg-white p-[7px_11px] text-[10px] text-[#7b899b] whitespace-nowrap [&_>_span]:w-[5px] [&_>_span]:h-[5px] [&_>_span]:rounded-[50%] [&_>_span]:bg-[#7e9ece] [@media(max-width:540px)]:hidden',
  'enrich-search-card':
    'bg-white [border:1px_solid_#e1e7f0] rounded-[11px] p-[25px_26px_0] shadow-[0_3px_15px_#273e6504] [@media(max-width:540px)]:p-[19px_17px_0]',
  'enrich-search-intro':
    'flex items-center gap-[12px] mb-[26px] [&_h2]:text-[15px] [&_h2]:font-semibold [&_h2]:tracking-[-0.2px] [&_p]:text-[#8e99a8] [&_p]:text-[11px] [&_p]:mt-[5px] [@media(max-width:540px)]:items-start',
  'enrich-feature-icon':
    'w-[43px] h-[43px] rounded-[11px] bg-[#eff2ff] text-[#6880d5] grid place-items-center flex-none',
  'enrich-search-form':
    'grid grid-cols-[1fr_1fr_auto] items-end gap-[16px] [&_label]:grid [&_label]:gap-[9px] [&_label]:min-w-0 [&_label_>_span]:text-[11px] [&_label_>_span]:text-[#556277] [&_label_>_span]:font-[550] [&_label_small]:text-[#9cacc1] [&_label_small]:font-normal [&_label_>_div]:flex [&_label_>_div]:items-center [&_label_>_div]:gap-[10px] [&_label_>_div]:[border:1px_solid_#dfe5ee] [&_label_>_div]:rounded-[7px] [&_label_>_div]:p-[0_13px] [&_label_>_div]:h-[43px] [&_label_>_div]:text-[#a0adbf] [&_label_>_div:focus-within]:border-[#93aceb] [&_label_>_div:focus-within]:shadow-[0_0_0_3px_#245be308] [&_input]:border-0 [&_input]:outline-none [&_input]:bg-transparent [&_input]:w-full [&_input]:min-w-0 [&_input]:text-[#3c4b61] [&_input]:text-[12px] [&_input::placeholder]:text-[#adb6c4] [&_svg]:flex-none [&_.button]:h-[43px] [&_.button]:p-[10px_23px] [&_.button]:text-[12px] [@media(max-width:800px)]:grid-cols-[1fr_1fr] [@media(max-width:800px)]:[&_>_button]:[grid-column:1/-1] [@media(max-width:540px)]:grid-cols-[1fr]',
  'enrich-search-hint':
    'flex items-center justify-between gap-[12px] bg-[#fbfcfe] m-[22px_-26px_0] [border-top:1px_solid_#edf0f5] p-[13px_26px] rounded-[0_0_11px_11px] [&_>_span]:inline-flex [&_>_span]:items-center [&_>_span]:gap-[7px] [&_>_span]:text-[#95a0b1] [&_>_span]:text-[10px] [&_svg]:flex-none [&_>_button]:inline-flex [&_>_button]:items-center [&_>_button]:gap-[6px] [&_>_button]:text-[10px] [&_>_button]:text-primary [&_>_button]:whitespace-nowrap [@media(max-width:1100px)]:items-start [@media(max-width:800px)]:flex-col [@media(max-width:540px)]:ml-[-17px] [@media(max-width:540px)]:mr-[-17px] [@media(max-width:540px)]:p-[13px_17px]',
  'enrich-search-error': 'text-[#bb4750] text-[11px] mt-[12px]',
  'enrich-process-strip':
    'grid grid-cols-[repeat(3,_1fr)] p-[27px_13px_31px] gap-[24px] [&_>_div]:flex [&_>_div]:items-center [&_>_div]:gap-[11px] [&_strong]:block [&_strong]:text-[11px] [&_strong]:font-[550] [&_strong]:text-[#637289] [&_small]:block [&_small]:text-[10px] [&_small]:text-[#a1adbc] [&_small]:mt-[3px] [&_>_div_>_svg]:ml-[auto] [&_>_div_>_svg]:text-[#b1bdce] [@media(max-width:800px)]:gap-[12px] [@media(max-width:800px)]:pl-[0] [@media(max-width:800px)]:pr-[0] [@media(max-width:800px)]:[&_>_div]:gap-[7px] [@media(max-width:800px)]:[&_>_div_>_svg]:hidden [@media(max-width:540px)]:grid-cols-[1fr] [@media(max-width:540px)]:p-[23px_5px] [@media(max-width:540px)]:gap-[16px]',
  'enrich-process-icon':
    'grid place-items-center w-[37px] h-[37px] [border:1px_solid_#e4eaf2] rounded-[9px] text-[#90a3c2] bg-[#fff8] flex-none',
  'enrich-records':
    '[border:1px_solid_#e2e7ef] bg-white rounded-[10px] overflow-hidden [&_>_header]:flex [&_>_header]:items-center [&_>_header]:justify-between [&_>_header]:gap-[18px] [&_>_header]:p-[21px_23px] [&_h2]:flex [&_h2]:items-center [&_h2]:gap-[9px] [&_h2]:text-[14px] [&_h2]:font-semibold [&_h2_>_span]:text-[10px] [&_h2_>_span]:text-[#7c8ca2] [&_h2_>_span]:bg-[#eef2f7] [&_h2_>_span]:p-[2px_6px] [&_h2_>_span]:rounded-[5px] [&_header_p]:text-[#97a2b1] [&_header_p]:text-[11px] [&_header_p]:mt-[5px] [&_table]:min-w-[820px] [&_th]:uppercase [&_th]:text-[9px] [&_th]:tracking-[0.45px] [&_th]:text-[#8d99aa] [&_th]:bg-[#fafbfd] [&_th]:[border-top:1px_solid_#edf0f5] [&_th]:p-[12px_20px] [&_td]:text-[11px] [&_td]:p-[22px_20px] [&_td_a]:inline-flex [&_td_a]:items-center [&_td_a]:gap-[6px] [&_td_a]:text-[#72839c] [&_>_footer]:bg-[#fcfdff] [&_>_footer]:[border-top:1px_solid_#eef1f5] [&_>_footer]:text-[#a0abba] [&_>_footer]:flex [&_>_footer]:gap-[7px] [&_>_footer]:items-center [&_>_footer]:text-[10px] [&_>_footer]:p-[13px_22px]',
  'enrich-record-count':
    'text-[10px] text-[#9aa6b7] flex items-center gap-[6px] [@media(max-width:540px)]:hidden',
  'enrich-record-company':
    'flex items-center gap-[10px] [&_.company-logo]:w-[33px] [&_.company-logo]:h-[33px] [&_.company-logo]:text-[18px] [&_strong]:block [&_strong]:text-[12px] [&_strong]:font-[550] [&_small]:block [&_small]:text-[10px] [&_small]:text-[#9aa7b8] [&_small]:mt-[4px]',
  'enrich-contacts':
    '[&_td_a]:inline-flex [&_td_a]:items-center [&_td_a]:gap-[6px] [&_td_a]:text-[#72839c] [&_table]:min-w-[850px] [&_td]:text-[11px] [&_td]:p-[17px_20px]',
  'enrich-status':
    'inline-flex items-center gap-[4px] text-[10px] text-[#318763] bg-[#edf8f2] rounded-[4px] p-[4px_7px]',
  'enrich-record-id': 'text-[#97a3b4] text-[10px]',
  'enrich-view-record':
    'flex items-center gap-[6px] text-[#426cb6] [border:1px_solid_#dde6f5] rounded-[5px] p-[7px_10px] text-[10px] bg-[#fbfcff]',
  'enrich-progress':
    'flex items-center flex-wrap gap-[14px] [border:1px_solid_#e0e7f7] bg-[#f3f6ff] p-[20px] rounded-[9px] m-[22px_0] [&_h2]:text-[12px] [&_h2]:font-semibold [&_h2]:text-[#5b6e99] [&_p]:text-[10px] [&_p]:text-[#8797b4] [&_p]:mt-[4px]',
  'enrich-progress-orb':
    'grid place-items-center w-[39px] h-[39px] bg-white rounded-[50%] text-[#7a8fd6]',
  'enrich-progress-steps':
    'flex flex-wrap gap-[16px] ml-[auto] [&_>_span]:flex [&_>_span]:items-center [&_>_span]:gap-[5px] [&_>_span]:text-[#b0bad0] [&_>_span]:text-[9px] [&_>_span.active]:text-[#627eb5] [&_>_span_>_span]:grid [&_>_span_>_span]:place-items-center [&_>_span_>_span]:[border:1px_solid_currentColor] [&_>_span_>_span]:rounded-[50%] [&_>_span_>_span]:w-[16px] [&_>_span_>_span]:h-[16px] [&_>_span_>_span]:text-[8px] [@media(max-width:1100px)]:ml-[0] [@media(max-width:1100px)]:[flex-basis:100%]',
  'enrich-complete-banner':
    'flex items-center justify-between gap-[12px] p-[12px_14px] bg-[#eef8f3] [border:1px_solid_#dcefe4] rounded-[7px] m-[-8px_0_20px] text-[#63917a] text-[10px] [&_>_span]:flex [&_>_span]:items-center [&_>_span]:flex-wrap [&_>_span]:gap-[8px]',
  'enrich-result-anchor': 'mt-[28px] [scroll-margin-top:85px]',
  'enrich-result': 'bg-white [border:1px_solid_#e0e6ef] rounded-[10px] overflow-hidden',
  'enrich-result-heading':
    'flex items-center justify-between gap-[15px] p-[23px_25px] [@media(max-width:540px)]:p-[19px_17px]',
  'enrich-company-identity':
    'flex items-center gap-[13px] [&_.company-logo]:w-[43px] [&_.company-logo]:h-[43px] [&_.company-logo]:text-[23px] [&_.company-logo]:flex-none [&_>_div_>_div]:flex [&_>_div_>_div]:items-center [&_>_div_>_div]:gap-[12px] [&_>_div_>_div]:flex-wrap [&_h2]:text-[18px] [&_h2]:font-semibold [&_h2]:tracking-[-0.3px] [&_p]:flex [&_p]:items-center [&_p]:flex-wrap [&_p]:gap-[6px] [&_p]:text-[#95a1b1] [&_p]:text-[10px] [&_p]:mt-[7px] [&_a]:flex [&_a]:items-center [&_a]:gap-[4px] [@media(max-width:540px)]:[&_h2]:text-[15px]',
  'enrich-sample-label':
    'flex items-center gap-[5px] text-[#9ba8ba] text-[10px] whitespace-nowrap [@media(max-width:800px)]:hidden',
  'enrich-result-tabs':
    'flex gap-[24px] p-[0_25px] [border-bottom:1px_solid_#e9edf3] overflow-x-auto [&_button]:flex [&_button]:items-center [&_button]:gap-[7px] [&_button]:text-[11px] [&_button]:text-[#95a0b1] [&_button]:p-[11px_0_13px] [&_button]:[border-bottom:2px_solid_transparent] [&_button]:whitespace-nowrap [&_button.active]:text-[#416cbc] [&_button.active]:[border-bottom-color:var(--primary)] [&_button_>_span]:text-[9px] [&_button_>_span]:bg-[#edf2f9] [&_button_>_span]:rounded-[4px] [&_button_>_span]:p-[1px_5px] [@media(max-width:540px)]:p-[0_17px] [@media(max-width:540px)]:gap-[18px]',
  'enrich-result-layout':
    'grid grid-cols-[minmax(0,_1fr)_290px] [@media(max-width:1100px)]:grid-cols-[minmax(0,_1fr)_250px] [@media(max-width:800px)]:grid-cols-[1fr]',
  'enrich-result-main': 'p-[4px_25px_15px] min-w-0 [@media(max-width:540px)]:p-[0_17px]',
  'enrich-info-section':
    'p-[23px_0] [border-bottom:1px_solid_#edf0f5] [&:last-child]:[border-bottom:0] [&_h3]:flex [&_h3]:items-center [&_h3]:gap-[8px] [&_h3]:text-[12px] [&_h3]:font-semibold [&_h3]:text-[#52647e] [&_h3_svg]:text-[#96a9c4] [&_>_p]:text-[#8492a5] [&_>_p]:text-[11px] [&_>_p]:leading-[1.9] [&_>_p]:mt-[14px]',
  'enrich-rail-card':
    '[&_h3]:flex [&_h3]:items-center [&_h3]:gap-[8px] [&_h3]:text-[12px] [&_h3]:font-semibold [&_h3]:text-[#52647e] [&_h3_svg]:text-[#96a9c4] bg-white [border:1px_solid_#e6ebf3] rounded-[8px] p-[17px] mb-[16px] [&_>_strong]:text-[#6b7e98] [&_>_strong]:text-[11px] [&_>_strong]:font-[550] [&_>_p]:text-[#a0adbd] [&_>_p]:text-[10px] [&_>_p]:mt-[5px] [&_>_small]:text-[8px] [&_>_small]:tracking-[1px] [&_>_small]:text-[#a5b0bf] [&_label]:block [&_label]:m-[19px_0_6px] [&_label]:text-[9px] [&_label]:text-[#a2adbd] [&_>_a]:flex [&_>_a]:items-center [&_>_a]:gap-[5px] [&_>_a]:text-[#7e93b4] [&_>_a]:text-[10px] [&_>_a]:wrap-anywhere',
  'enrich-key-facts':
    'grid grid-cols-[repeat(3,_1fr)] gap-[22px_18px] mt-[24px] [&_small]:block [&_small]:text-[9px] [&_small]:text-[#a2adbd] [&_small]:mb-[7px] [&_strong]:block [&_strong]:text-[11px] [&_strong]:font-medium [&_strong]:text-[#5d6e88] [@media(max-width:1100px)]:grid-cols-[1fr_1fr]',
  'enrich-tags':
    'flex flex-wrap gap-[6px] mt-[14px] [&_>_span]:text-[#7d8fa9] [&_>_span]:bg-[#f4f7fb] [&_>_span]:[border:1px_solid_#e9eef6] [&_>_span]:rounded-[5px] [&_>_span]:p-[5px_8px] [&_>_span]:text-[10px]',
  'enrich-experience':
    'flex items-center gap-[22px] mt-[17px] [&_>_strong]:text-[23px] [&_>_strong]:text-[#6982ac] [&_>_strong]:leading-[1.3] [&_>_strong]:font-semibold [&_>_strong]:flex-none [&_small]:block [&_small]:text-[9px] [&_small]:text-[#a1aec0] [&_small]:font-normal [&_small]:mt-[5px] [&_p]:text-[11px] [&_p]:leading-[1.8] [&_p]:text-[#8f9bae] [@media(max-width:540px)]:flex-col [@media(max-width:540px)]:items-start [@media(max-width:540px)]:gap-[12px]',
  'enrich-capabilities':
    'grid grid-cols-[1fr_1fr] gap-[12px] mt-[23px] [&_>_span]:flex [&_>_span]:gap-[7px] [&_>_span]:items-center [&_>_span]:text-[10px] [&_>_span]:text-[#8597ad] [&_svg]:text-[#91b5a7] [&_svg]:flex-none [@media(max-width:540px)]:grid-cols-[1fr]',
  'enrich-result-rail':
    'bg-[#fbfcfe] [border-left:1px_solid_#edf0f6] p-[23px_20px] [@media(max-width:800px)]:[border-left:0] [@media(max-width:800px)]:[border-top:1px_solid_#edf0f6] [@media(max-width:800px)]:grid [@media(max-width:800px)]:grid-cols-[1fr_1fr] [@media(max-width:800px)]:gap-[15px] [@media(max-width:540px)]:grid-cols-[1fr] [@media(max-width:540px)]:p-[17px]',
  'enrich-location-visual':
    'h-[95px] relative overflow-hidden bg-[#f3f6fa] [background-image:linear-gradient(#e4eaf366_1px,_transparent_1px),_linear-gradient(90deg,_#e4eaf366_1px,_transparent_1px)] [background-size:23px_23px] rounded-[6px] grid place-items-center m-[16px_0_13px] [&_>_div]:absolute [&_>_div]:h-[170px] [&_>_div]:w-[22px] [&_>_div]:bg-[#fff9] [&_>_div]:[transform:rotate(45deg)] [&_>_span]:grid [&_>_span]:place-items-center [&_>_span]:rounded-[50%] [&_>_span]:w-[45px] [&_>_span]:h-[45px] [&_>_span]:bg-[#e3ebf9] [&_>_span]:text-[#7294c4] [&_>_span]:z-[1]',
  'enrich-rail-divider': 'h-[1px] bg-[#eef1f6] m-[16px_0_12px]',
  'enrich-text-button': 'flex items-center gap-[5px] mt-[19px] text-[#597db6] text-[10px]',
  'enrich-coverage':
    'flex items-start gap-[8px] text-[#98a8be] p-[2px_4px] [&_>_svg]:flex-none [&_strong]:text-[10px] [&_strong]:font-medium [&_p]:text-[9px] [&_p]:leading-[1.7] [&_p]:mt-[4px]',
  'enrich-contact-intro':
    'p-[22px_25px] [&_h3]:text-[13px] [&_h3]:font-[550] [&_p]:text-[11px] [&_p]:text-[#8c9bb0] [&_p]:mt-[6px]',
  'enrich-contact-name':
    'font-medium [&_.person-avatar]:w-[29px] [&_.person-avatar]:h-[29px] [&_.person-avatar]:text-[10px]',
  'enrich-muted': 'text-[#a5afbd] [&_>_svg]:inline [&_>_svg]:align-middle [&_>_svg]:mr-[5px]',
  'enrich-research-notes':
    'p-[30px] max-w-[660px] [&_h3]:text-[14px] [&_h3]:font-[550] [&_p]:text-[12px] [&_p]:text-[#8a9bb1] [&_p]:leading-[1.9] [&_p]:mt-[12px] [&_dl]:mt-[22px] [&_dl_>_div]:grid [&_dl_>_div]:grid-cols-[120px_1fr] [&_dl_>_div]:p-[12px_0] [&_dl_>_div]:gap-[12px] [&_dl_>_div]:[border-bottom:1px_solid_#eef1f5] [&_dl_>_div]:text-[11px] [&_dt]:text-[#a0adbf] [&_dd]:text-[#6f8098]',
  'enrich-research-icon':
    'grid place-items-center w-[45px] h-[45px] rounded-[10px] bg-[#f0f4fb] text-[#8fa5c8] mb-[16px]',
  'enrich-spin':
    'animate-[enrich-spin_1s_linear_infinite] [@media(prefers-reduced-motion:reduce)]:animate-[none]',
  'workflow-eyebrow':
    'inline-flex items-center gap-[6px] text-[#6e8bc1] text-[10px] font-semibold tracking-[1.2px] mb-[11px]',
  'workflow-demo-pill':
    'inline-flex items-center [border:1px_solid_#e5e5f5] rounded-[20px] bg-[#f7f6fd] p-[5px_9px] text-[9px] font-[550] text-[#8e83b1] whitespace-nowrap tracking-[0.2px]',
  'workflow-breadcrumb':
    'flex items-center gap-[8px] text-[11px] text-[#9aa5b5] mb-[25px] [&_a]:text-[#718198]',
  'workflow-back-link': 'inline-flex items-center gap-[7px] text-[11px] text-[#7d8ca2] mb-[23px]',
  'research-page':
    'max-w-[1360px] m-[auto] p-[26px_32px_30px] [&_a:hover]:text-primary [&_button:focus-visible]:[outline:2px_solid_var(--primary)] [&_button:focus-visible]:[outline-offset:3px] [&_a:focus-visible]:[outline:2px_solid_var(--primary)] [&_a:focus-visible]:[outline-offset:3px] [@media(max-width:1150px)]:p-[24px] [@media(max-width:540px)]:p-[20px_16px]',
  'research-page-heading':
    'flex items-center justify-between gap-[20px] mb-[24px] [&_h1]:text-[25px] [&_h1]:font-semibold [&_h1]:tracking-[-0.7px] [&_h1]:text-[#293a53] [&_h1]:leading-[1.35] [&_p]:text-[#78889e] [&_p]:text-[12px] [&_p]:mt-[9px] [@media(max-width:900px)]:items-start [@media(max-width:900px)]:[&_h1]:text-[22px] [@media(max-width:540px)]:flex-col [@media(max-width:540px)]:gap-[14px] [@media(max-width:540px)]:[&_h1]:text-[23px]',
  'research-report-header':
    '[&_h1]:text-[25px] [&_h1]:font-semibold [&_h1]:tracking-[-0.7px] [&_h1]:text-[#293a53] [&_h1]:leading-[1.35] [&_p]:text-[#78889e] [&_p]:text-[12px] [&_p]:mt-[9px] flex items-center justify-between gap-[18px] mb-[24px] [&_>_a]:flex-none [&_>_a]:bg-white [&_>_a]:text-[11px] [@media(max-width:540px)]:[&_h1]:text-[23px] [@media(max-width:540px)]:flex-col [@media(max-width:540px)]:items-start',
  'research-cancel': 'bg-white text-[11px] p-[7px_11px] flex-none text-[#8995a8]',
  'research-company-strip':
    'flex items-center gap-[12px] p-[14px_18px] bg-white [border:1px_solid_#e4e9f2] rounded-[9px] mb-[18px] [&_>_div]:grid [&_>_div]:gap-[5px] [&_>_div]:min-w-0 [&_strong]:text-[12px] [&_strong]:font-[550] [&_strong]:text-[#5e718d] [&_strong]:wrap-anywhere [&_>_div_>_span]:flex [&_>_div_>_span]:items-center [&_>_div_>_span]:gap-[5px] [&_>_div_>_span]:text-[#a0adbf] [&_>_div_>_span]:text-[10px] [&_>_div_>_span]:wrap-anywhere [@media(max-width:900px)]:flex-wrap [@media(max-width:540px)]:gap-[9px] [@media(max-width:540px)]:[&_>_.workflow-demo-pill]:ml-[auto]',
  'research-company-avatar':
    'w-[37px] h-[37px] rounded-[8px] bg-[#eff4fc] text-[#91a8cc] grid place-items-center flex-none',
  'research-elapsed':
    'inline-flex items-center gap-[6px] ml-[auto] text-[#99a6b9] text-[10px] whitespace-nowrap tabular-nums [@media(max-width:540px)]:[flex-basis:100%] [@media(max-width:540px)]:ml-[47px]',
  'research-workspace':
    'grid grid-cols-[minmax(0,_1.18fr)_minmax(300px,_1fr)] [border:1px_solid_#e2e8f2] rounded-[12px] bg-white overflow-hidden [@media(max-width:1150px)]:grid-cols-[minmax(0,_1fr)_minmax(300px,_1fr)] [@media(max-width:900px)]:grid-cols-[1fr]',
  'research-visual':
    'text-center p-[10px_28px_28px] [background:radial-gradient(ellipse_at_50%_27%,_#f0f4ff_0,_white_72%)] [&_h2]:text-[19px] [&_h2]:font-semibold [&_h2]:text-[#536b8d] [&_h2]:m-[17px_0_8px] [&_h2]:tracking-[-0.4px] [&_>_p]:text-[11px] [&_>_p]:text-[#7b8fa8] [&_>_p]:max-w-[320px] [&_>_p]:m-[0_auto] [&_>_p]:leading-[1.9] [&_>_small]:text-[#a7b2c4] [&_>_small]:text-[9px] [@media(max-width:1150px)]:pl-[15px] [@media(max-width:1150px)]:pr-[15px] [@media(max-width:900px)]:pb-[24px]',
  'research-orbit-scene':
    'relative h-[255px] max-w-[420px] m-[0_auto_12px] grid place-items-center [@media(max-width:540px)]:max-w-[340px]',
  'research-orbit':
    'absolute [border:1px_solid_#dfe7f6] rounded-[50%] [@media(prefers-reduced-motion:reduce)]:animate-[none]',
  'research-scan':
    'w-[210px] h-[210px] absolute rounded-[50%] [background:conic-gradient(from_0deg,_transparent_65%,_#769be917_90%,_transparent)] animate-[research-orbit_8s_linear_infinite] [@media(prefers-reduced-motion:reduce)]:animate-[none]',
  'research-core':
    'w-[84px] h-[84px] [border:7px_solid_#f5f7fe] [background:linear-gradient(145deg,_#dce8ff,_#eef0ff)] shadow-[0_0_0_1px_#e4eaf8,_0_10px_40px_#7095d71c] rounded-[26px] flex items-center justify-center text-[#7898d7] relative [&_>_span]:absolute [&_>_span]:bottom-[-6px] [&_>_span]:right-[-8px] [&_>_span]:[border:3px_solid_white] [&_>_span]:bg-[#8c9cd6] [&_>_span]:text-white [&_>_span]:text-[8px] [&_>_span]:rounded-[8px] [&_>_span]:p-[2px_5px]',
  'research-node':
    'flex items-center gap-[7px] absolute [border:1px_solid_#e2e8f4] bg-[#ffffffed] shadow-[0_5px_16px_#36568d07] rounded-[8px] p-[9px_10px] text-[9px] text-[#94a4bf] [transform:translateY(0)] [transition:border-color_0.5s,_transform_0.5s,_box-shadow_0.5s] [&_>_svg:first-child]:text-[#9eafce] [&_>_svg:last-child]:hidden [&_>_svg:last-child]:text-[#83b79d] [&.revealed]:border-[#d4e7dd] [&.revealed]:[transform:translateY(-3px)] [&.revealed]:shadow-[0_5px_18px_#648a6c0b] [&.revealed_>_svg:last-child]:block [@media(max-width:1150px)]:p-[8px] [@media(max-width:1150px)]:text-[8px] [@media(max-width:540px)]:p-[8px_7px] [@media(max-width:540px)]:gap-[5px] [@media(prefers-reduced-motion:reduce)]:[transition:none]',
  'node-website': 'top-[43px] left-[10px] [@media(max-width:1150px)]:left-[0]',
  'node-business': 'top-[52px] right-[1px] [@media(max-width:1150px)]:right-[-3px]',
  'node-contacts': 'bottom-[32px] left-[0]',
  'node-record': 'bottom-[32px] right-[0]',
  'research-current-status':
    'inline-flex items-center gap-[7px] bg-[#f1f5ff] [border:1px_solid_#e6ecfb] rounded-[20px] p-[6px_10px] text-[#8296bd] text-[9px] max-w-full',
  'research-live-dot':
    'w-[5px] h-[5px] rounded-[50%] inline-block bg-[#84a1d5] flex-none animate-[research-pulse_2s_ease-in-out_infinite] [@media(prefers-reduced-motion:reduce)]:animate-[none]',
  'research-step-meter':
    'flex gap-[5px] max-w-[225px] m-[21px_auto_9px] [&_>_span]:flex-1 [&_>_span]:h-[4px] [&_>_span]:rounded-[3px] [&_>_span]:bg-[#edf1f7] [&_>_span.done]:bg-[#93aecf] [&_>_span.current]:bg-[#b6c9eb] [&_>_span.current]:animate-[research-pulse_2s_ease-in-out_infinite] [@media(prefers-reduced-motion:reduce)]:[&_>_span.current]:animate-[none]',
  'research-stage-panel':
    "[border-left:1px_solid_#e8edf5] p-[25px_25px_0] [&_>_header]:flex [&_>_header]:items-center [&_>_header]:justify-between [&_>_header]:gap-[10px] [&_>_header]:mb-[26px] [&_h2]:text-[12px] [&_h2]:font-semibold [&_h2]:text-[#647795] [&_>_header_>_span]:text-[9px] [&_>_header_>_span]:text-[#a3b0c3] [&_>_header_>_span]:whitespace-nowrap [&_ol]:list-none [&_ol]:p-0 [&_ol]:m-0 [&_li]:flex [&_li]:items-start [&_li]:gap-[12px] [&_li]:relative [&_li]:min-h-[74px] [&_li:not(:last-child)::after]:[content:''] [&_li:not(:last-child)::after]:absolute [&_li:not(:last-child)::after]:left-[13px] [&_li:not(:last-child)::after]:top-[31px] [&_li:not(:last-child)::after]:bottom-[5px] [&_li:not(:last-child)::after]:w-[1px] [&_li:not(:last-child)::after]:bg-[#e9edf5] [&_h3]:text-[11px] [&_h3]:font-[550] [&_h3]:text-[#78899f] [&_h3]:m-[3px_0_5px] [&_li_p]:text-[10px] [&_li_p]:leading-[1.7] [&_li_p]:text-[#8796aa] [&_li_p]:max-w-[270px] [&_.active_.research-stage-marker]:text-[#7898d0] [&_.active_.research-stage-marker]:bg-[#f0f5ff] [&_.active_.research-stage-marker]:border-[#dce7fb] [&_.active_.research-stage-marker]:shadow-[0_0_0_3px_#f7f9ff] [&_.active_h3]:text-[#44658e] [&_.active_p]:text-[#70839f] [&_.active_small]:inline-block [&_.active_small]:text-[8px] [&_.active_small]:text-[#93a8cc] [&_.active_small]:mt-[4px] [&_.complete_.research-stage-marker]:text-[#86b29a] [&_.complete_.research-stage-marker]:border-[#deede4] [&_.complete_.research-stage-marker]:bg-[#f0f8f4] [&_.complete_h3]:text-[#60758f] [&_.complete_p]:text-[#7f91aa] [&_>_footer]:flex [&_>_footer]:items-start [&_>_footer]:gap-[8px] [&_>_footer]:[border-top:1px_solid_#edf0f6] [&_>_footer]:p-[15px_0_17px] [&_>_footer]:text-[#a9b4c5] [&_>_footer_>_svg]:flex-none [&_>_footer_>_svg]:mt-[2px] [&_>_footer_>_p]:text-[9px] [&_>_footer_>_p]:leading-[1.8] [@media(max-width:1150px)]:pl-[20px] [@media(max-width:1150px)]:pr-[20px] [@media(max-width:900px)]:[border-left:0] [@media(max-width:900px)]:[border-top:1px_solid_#e8edf5] [@media(max-width:900px)]:pt-[20px] [@media(max-width:900px)]:[&_li]:min-h-[78px]",
  'research-stage-marker':
    'grid place-items-center w-[28px] h-[28px] [border:1px_solid_#e7ecf5] rounded-[50%] bg-[#fafbfd] text-[#b4becd] text-[10px] flex-none',
  'research-activity':
    'mt-[18px] bg-white [border:1px_solid_#e3e9f2] rounded-[9px] p-[17px_20px] [&_>_header]:flex [&_>_header]:items-center [&_>_header]:gap-[7px] [&_>_header]:mb-[14px] [&_h2]:text-[11px] [&_h2]:font-[550] [&_h2]:text-[#60758f] [&_>_header_>_span:last-child]:ml-[auto] [&_>_header_>_span:last-child]:text-[9px] [&_>_header_>_span:last-child]:text-[#adb8c8] [&_>_div]:flex [&_>_div]:flex-col [&_>_div]:gap-[10px] [&_p]:flex [&_p]:gap-[9px] [&_p]:items-center [&_p]:text-[10px] [&_p]:text-[#788ba5] [&_time]:text-[9px] [&_time]:tabular-nums [&_time]:text-[#bac3d1] [&_time]:min-w-[29px]',
  'research-log-active': 'text-[8px] text-[#a2b0c9] bg-[#f3f6fb] rounded-[3px] p-[1px_4px]',
  'research-page-footer':
    'flex items-center justify-between gap-[12px] p-[20px_0_0] [&_>_a]:flex [&_>_a]:items-center [&_>_a]:gap-[6px] [&_>_a]:text-[10px] [&_>_a]:text-[#9aaac0] [&_>_span]:flex [&_>_span]:items-center [&_>_span]:gap-[6px] [&_>_span]:text-[10px] [&_>_span]:text-[#9aaac0] [@media(max-width:540px)]:flex-col [@media(max-width:540px)]:items-start',
  'research-loading':
    'min-h-[calc(100dvh_-_65px)] p-[60px_24px] flex flex-col items-center justify-center text-center gap-[18px] text-[#8ca2c1] [&_p]:text-[12px]',
  'research-empty':
    'min-h-[calc(100dvh_-_65px)] p-[60px_24px] flex flex-col items-center justify-center text-center gap-[18px] text-[#8ca2c1] [&_h1]:text-[24px] [&_h1]:font-semibold [&_h1]:text-[#516b8e] [&_p]:text-[12px] [&_p]:max-w-[390px] [&_p]:text-[#99a8be] [&_p]:leading-[1.9] [&_>_div]:flex [&_>_div]:gap-[10px] [&_>_div]:flex-wrap [&_>_div]:justify-center',
  'research-resume-banner':
    'bg-[#f0f4ff] [border:1px_solid_#e0e8fc] rounded-[7px] p-[13px_16px] flex justify-between items-center gap-[12px] mt-[18px] [&_>_span]:flex [&_>_span]:items-center [&_>_span]:gap-[8px] [&_>_span]:text-[#8198bf] [&_>_span]:text-[10px] [&_>_span]:flex-wrap [&_strong]:font-[550] [&_>_a]:flex [&_>_a]:items-center [&_>_a]:gap-[6px] [&_>_a]:text-[#6a89bb] [&_>_a]:text-[10px] [&_>_a]:whitespace-nowrap [@media(max-width:540px)]:items-start [@media(max-width:540px)]:flex-col',
  'research-report-notice':
    'flex items-center gap-[11px] bg-[#f5f7fd] [border:1px_solid_#e2e7f4] rounded-[8px] p-[14px_16px] text-[#9ba9c0] [&_>_svg]:flex-none [&_>_svg]:text-[#9fafd1] [&_p]:text-[10px] [&_p]:leading-[1.9] [&_p]:flex-1 [&_strong]:font-[550] [&_strong]:text-[#8395b3] [@media(max-width:900px)]:[&_>_.workflow-demo-pill]:hidden',
  'research-report-stats':
    'grid grid-cols-[repeat(4,_1fr)] gap-[12px] m-[20px_0] [&_>_div]:flex [&_>_div]:items-center [&_>_div]:gap-[10px] [&_>_div]:[border:1px_solid_#e4eaf3] [&_>_div]:rounded-[7px] [&_>_div]:bg-white [&_>_div]:p-[15px] [&_>_div]:text-[#a0b2cb] [&_span]:grid [&_span]:gap-[6px] [&_span]:text-[9px] [&_span]:text-[#a5b1c3] [&_strong]:text-[11px] [&_strong]:font-[550] [&_strong]:text-[#7f92af] [@media(max-width:900px)]:grid-cols-[1fr_1fr] [@media(max-width:540px)]:gap-[8px] [@media(max-width:540px)]:[&_>_div]:p-[12px] [@media(max-width:540px)]:[&_>_div]:gap-[7px]',
  'research-evidence':
    'bg-white [border:1px_solid_#e2e8f1] rounded-[9px] mt-[20px] [&_>_header]:flex [&_>_header]:items-center [&_>_header]:gap-[8px] [&_>_header]:p-[18px_22px] [&_>_header]:[border-bottom:1px_solid_#edf1f7] [&_>_header]:text-[#98adc9] [&_h2]:text-[12px] [&_h2]:font-[550] [&_h2]:text-[#7c91ae] [&_h2]:flex-1 [&_header_>_span]:text-[9px] [&_header_>_span]:text-[#a9b5c7] [&_>_div]:grid [&_>_div]:grid-cols-[1fr_1fr] [&_>_div]:p-[21px_22px] [&_>_div]:gap-[30px] [&_h3]:text-[11px] [&_h3]:text-[#8699b3] [&_h3]:font-[550] [&_h3]:mb-[10px] [&_p]:text-[10px] [&_p]:text-[#a3b0c3] [&_p]:leading-[1.9] [&_li]:text-[10px] [&_li]:text-[#a3b0c3] [&_li]:leading-[1.9] [&_ul]:pl-[15px] [&_ul]:m-0 [@media(max-width:540px)]:[&_>_div]:grid-cols-[1fr] [@media(max-width:540px)]:[&_>_div]:gap-[20px] [@media(max-width:540px)]:[&_>_header]:p-[17px] [@media(max-width:540px)]:[&_header_>_span]:hidden',
  'research-source-sample':
    'flex items-center gap-[6px] text-[#91a5c1] text-[10px] mt-[14px] [&_small]:text-[8px] [&_small]:text-[#b0bbcc] [&_small]:ml-[auto]',
  'research-report-footer':
    'flex items-center justify-between gap-[14px] mt-[22px] [&_>_span]:flex [&_>_span]:items-center [&_>_span]:gap-[6px] [&_>_span]:text-[10px] [&_>_span]:text-[#9cacc3] [&_>_a]:flex [&_>_a]:items-center [&_>_a]:gap-[6px] [&_>_a]:text-[10px] [&_>_a]:text-[#9cacc3] [@media(max-width:540px)]:flex-col [@media(max-width:540px)]:items-start',
  'research-report-page': '[&_a:hover]:text-primary',
};

/** Compose shared recipes while retaining semantic markers for descendant variants. */
export function ui(names: string): string {
  return twMerge(
    names
      .split(/\s+/)
      .filter(Boolean)
      .map((name) => (recipes[name] ? `${name} ${recipes[name]}` : name))
      .join(' '),
  );
}
