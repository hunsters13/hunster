const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  
  res.end(`<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HUNSTER - Enterprise Traffic & Slot Operations</title>
  <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css" rel="stylesheet">
  <style>
    :root {
      --bg-body: #f8fafc; --bg-card: #ffffff; --border: #e2e8f0; --border-subtle: #f1f5f9;
      --text-main: #0f172a; --text-sub: #64748b; --primary: #2563eb; --primary-hover: #1d4ed8;
      --primary-light: #eff6ff; --success: #059669; --success-bg: #ecfdf5; --warning-bg: #fffbeb; --warning-text: #d97706;
      --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05); --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.07); --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.08);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Pretendard', sans-serif; scroll-behavior: smooth; }
    body { background-color: var(--bg-body); color: var(--text-main); line-height: 1.6; word-break: keep-all; }

    header { height: 80px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; padding: 0 40px; background: rgba(255, 255, 255, 0.95); position: sticky; top: 0; z-index: 100; box-shadow: var(--shadow-sm); }
    .logo-area { display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 1.15rem; color: #0f172a; text-decoration: none; cursor: pointer; }
    .logo-icon { width: 34px; height: 34px; background: var(--primary); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; }
    .nav-links { display: flex; gap: 24px; align-items: center; }
    .nav-links a { text-decoration: none; color: var(--text-sub); font-weight: 600; font-size: 0.9rem; cursor: pointer; }
    .nav-links a:hover { color: var(--primary); }
    
    .header-right { display: flex; gap: 12px; align-items: center; }
    .lang-select { padding: 8px 12px; border-radius: 8px; border: 1px solid var(--border); background: white; font-size: 0.88rem; font-weight: 700; color: var(--text-main); outline: none; cursor: pointer; }
    
    .auth-actions { display: flex; gap: 8px; align-items: center; }
    .btn { padding: 8px 16px; border-radius: 8px; font-size: 0.88rem; font-weight: 600; cursor: pointer; border: 1px solid var(--border); background: white; color: var(--text-main); white-space: nowrap; }
    .btn-primary { background: var(--primary); border-color: var(--primary); color: white; }

    .page-view { display: none; }
    .page-view.active { display: block; }
    .wrapper { max-width: 1200px; margin: 0 auto; padding: 40px 20px; display: flex; flex-direction: column; gap: 60px; }

    .hero { text-align: center; padding: 40px 0; }
    .hero-badge { display: inline-block; background: var(--primary-light); color: var(--primary); padding: 6px 14px; border-radius: 20px; font-size: 0.82rem; font-weight: 700; margin-bottom: 16px; }
    .hero h1 { font-size: 2.5rem; font-weight: 800; color: #0f172a; line-height: 1.25; margin-bottom: 16px; }
    .hero p { font-size: 1.05rem; color: var(--text-sub); max-width: 700px; margin: 0 auto 28px auto; }

    .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; }
    .metric-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; padding: 24px; box-shadow: var(--shadow-md); position: relative; overflow: hidden; }
    .metric-card::before { content: ''; position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: var(--primary); }
    .metric-title { font-size: 0.88rem; font-weight: 700; color: var(--text-sub); margin-bottom: 8px; }
    .metric-value { font-size: 2rem; font-weight: 800; color: #0f172a; }
    .metric-footer { font-size: 0.82rem; color: var(--success); font-weight: 600; margin-top: 8px; }

    .status-section-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .card-box { background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; padding: 28px; box-shadow: var(--shadow-md); }
    .card-box h3 { font-size: 1.2rem; font-weight: 800; margin-bottom: 16px; }
    .server-status-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border-subtle); font-size: 0.92rem; }
    .badge-online { background: var(--success-bg); color: var(--success); padding: 4px 10px; border-radius: 20px; font-size: 0.78rem; font-weight: 700; }
    .badge-preparing { background: var(--warning-bg); color: var(--warning-text); padding: 4px 10px; border-radius: 20px; font-size: 0.78rem; font-weight: 700; }

    .pricing-section { background: var(--bg-card); border: 1px solid var(--border); border-radius: 20px; padding: 36px; box-shadow: var(--shadow-lg); }
    .pricing-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 24px; }
    .price-card { background: var(--bg-body); border: 1px solid var(--border); border-radius: 14px; padding: 24px; display: flex; flex-direction: column; justify-content: space-between; }
    .price-card.featured { border-color: var(--primary); background: var(--primary-light); }
    .price-title { font-size: 1.1rem; font-weight: 800; margin-bottom: 6px; }
    .price-desc { font-size: 0.88rem; color: var(--text-sub); margin-bottom: 16px; }
    .price-tag { font-size: 1.6rem; font-weight: 800; color: var(--primary); margin-bottom: 16px; }
    .price-tag span { font-size: 0.85rem; color: var(--text-sub); font-weight: 500; text-decoration: line-through; margin-left: 6px; }

    .auth-container { max-width: 550px; margin: 40px auto; background: var(--bg-card); border: 1px solid var(--border); border-radius: 20px; padding: 36px; box-shadow: var(--shadow-lg); }
    .auth-container h2 { font-size: 1.6rem; font-weight: 800; margin-bottom: 6px; color: #0f172a; }
    .auth-container p { color: var(--text-sub); font-size: 0.9rem; margin-bottom: 24px; }
    .form-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-label { font-size: 0.88rem; font-weight: 700; color: #334155; }
    .form-input, .form-select { width: 100%; padding: 12px 16px; border: 1px solid var(--border); border-radius: 10px; font-size: 0.95rem; background: #fafafa; outline: none; color: #0f172a; font-weight: 500; }
    .sub-option-box { background: var(--primary-light); border: 1px solid #bfdbfe; padding: 16px; border-radius: 12px; margin-top: 8px; display: none; }

    .dashboard-container { max-width: 1100px; margin: 30px auto; padding: 0 16px; overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; margin-top: 16px; background: white; border-radius: 12px; overflow: hidden; border: 1px solid var(--border); min-width: 600px; }
    .data-table th, .data-table td { padding: 14px 16px
