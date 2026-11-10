"""Export the readable part of a Claude Code session transcript (.jsonl) to Markdown.
Keeps the user's messages and Claude's replies; drops tool calls, tool output, hidden reasoning and system notices.
Usage: python3 export_chat.py <session.jsonl> <out.md> [title]"""
import json, re, sys, pathlib
src, dst = sys.argv[1], sys.argv[2]
title = sys.argv[3] if len(sys.argv) > 3 else 'Suhbat'
SKIP_PREFIX = ('Stop hook feedback', '<local-command', '<command-', "This session's worker process was restarted",
               '[Request interrupted', '<task-notification', 'Tool loaded', '[SYSTEM NOTIFICATION')
EMAIL = re.compile(r'[\w.+-]+@[\w-]+\.[\w.]+')

def clean_user(text):
    text = re.sub(r'<system-reminder>.*?</system-reminder>', '', text, flags=re.S)
    text = re.sub(r'<local-command-caveat>.*?</local-command-caveat>', '', text, flags=re.S)
    text = re.sub(r'<command-(name|message|args)>.*?</command-\1>', '', text, flags=re.S)
    text = re.sub(r'<local-command-stdout>.*?</local-command-stdout>', '', text, flags=re.S)
    text = re.sub(r"This session's worker process was restarted\..*?(continue from where you left off\.)", '', text, flags=re.S)
    text = re.sub(r'@"(/[^"]+)"', lambda m: '[fayl: ' + pathlib.Path(m.group(1)).name + ']', text)
    text = re.sub(r'\[Image: source: [^\]]+\]', '[rasm]', text)
    text = re.sub(r'\[Image: original[^\]]+\]', '', text)
    return text.strip()

entries = []
for line in open(src, encoding='utf-8'):
    try: d = json.loads(line)
    except Exception: continue
    if d.get('isSidechain') or d.get('type') not in ('user', 'assistant'): continue
    c = d.get('message', {}).get('content')
    blocks = [{'type': 'text', 'text': c}] if isinstance(c, str) else (c or [])
    if d['type'] == 'user':
        if any(b.get('type') == 'tool_result' for b in blocks): continue
        parts, imgs = [], 0
        for b in blocks:
            if b.get('type') == 'image': imgs += 1
            elif b.get('type') == 'text':
                t = b.get('text', '')
                if t.lstrip().startswith(SKIP_PREFIX) and '<system-reminder>' not in t[:40]: continue
                t = clean_user(t)
                if t and not t.startswith(SKIP_PREFIX): parts.append(t)
        if imgs: parts.insert(0, '[skrinshot]' if imgs == 1 else f'[{imgs} ta rasm]')
        if parts: entries.append(['user', '\n\n'.join(parts), d.get('timestamp', '')])
    else:
        t = '\n\n'.join(b['text'] for b in blocks if b.get('type') == 'text' and b.get('text', '').strip())
        if not t: continue
        if entries and entries[-1][0] == 'assistant': entries[-1][1] += '\n\n' + t
        else: entries.append(['assistant', t, d.get('timestamp', '')])

out = [f'# {title}', '',
       'Foydalanuvchi va Claude o\'rtasidagi yozishmaning matn qismi. Buyruqlar, fayl ishlari va tizim xabarlari olib tashlangan.',
       'Rasmlar va videolar o\'rniga [skrinshot] / [fayl: ...] belgisi qo\'yilgan.', '']
day = None
for role, text, ts in entries:
    if ts[:10] != day:
        day = ts[:10]; out += ['', f'## {day}', '']
    who = '**Siz**' if role == 'user' else '**Claude**'
    out += [f'### {who} ({ts[11:16]} UTC)', '', EMAIL.sub('[email]', text), '']
pathlib.Path(dst).write_text('\n'.join(out), encoding='utf-8')
print(len(entries), 'messages ->', dst)
