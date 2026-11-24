"""Refresh public home feeds. No API keys, article bodies or user data."""
import concurrent.futures,datetime,email.utils,json,os,pathlib,re,urllib.request,urllib.parse,xml.etree.ElementTree as ET
ROOT=pathlib.Path(__file__).resolve().parents[1]
FEEDS=[('PC Gamer','https://www.pcgamer.com/feeds.xml','pcgamer.com'),('GamesRadar+','https://www.gamesradar.com/feeds.xml','gamesradar.com'),('GamingOnLinux','https://www.gamingonlinux.com/article_rss.php','gamingonlinux.com')]
def get(url):
 req=urllib.request.Request(url,headers={'User-Agent':'Journey/1.0 (+https://sve1.github.io/GAMEPAL/)','Accept':'application/json, application/rss+xml, application/xml'})
 with urllib.request.urlopen(req,timeout=15) as response:return response.read(5_000_000)
def https(url,host=None):
 try:
  u=urllib.parse.urlparse(url)
  return url if u.scheme=='https' and u.hostname and (not host or u.hostname==host or u.hostname.endswith('.'+host)) else None
 except ValueError:return None
def feed(source,url,host):
 root=ET.fromstring(get(url));items=[]
 for item in root.findall('.//item'):
  title=re.sub(r'\s+',' ',item.findtext('title','')).strip();link=https(item.findtext('link',''),host)
  try:published=email.utils.parsedate_to_datetime(item.findtext('pubDate','')).astimezone(datetime.timezone.utc).isoformat()
  except (ValueError,TypeError,AttributeError):continue
  if not title or not link:continue
  if host=='gamesradar.com' and not urllib.parse.urlparse(link).path.startswith(('/games/','/platforms/','/hardware/','/gaming-')):continue
  # Only publisher-supplied thumbnails; no scraped article pages or text.
  image=None
  for child in item.iter():
   if child.tag.split('}')[-1] in ('thumbnail','content','enclosure'):
    candidate=https(child.get('url',''))
    if candidate and (child.tag.endswith('thumbnail') or child.get('medium')=='image' or child.get('type','').startswith('image/')):image=candidate;break
  items.append({'title':title[:240],'url':link,'source':source,'publishedAt':published,'image':image})
 return sorted(items,key=lambda x:x['publishedAt'],reverse=True)[:4]
def write(name,data):
 target=ROOT/'data'/name;tmp=target.with_suffix('.tmp');tmp.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');tmp.replace(target)
def main():
 stamp=datetime.datetime.now(datetime.timezone.utc).isoformat();articles=[];sources=[];failed=[]
 with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
  futures={pool.submit(feed,*f):f[0] for f in FEEDS}
  for future in concurrent.futures.as_completed(futures):
   try:
    rows=future.result()
    if not rows:raise ValueError('No usable headlines')
    articles+=rows;sources.append(futures[future])
   except Exception as error:failed.append(futures[future]);print(f'Feed unavailable: {futures[future]} ({type(error).__name__})')
 if articles:
  seen=set();articles=[a for a in sorted(articles,key=lambda x:x['publishedAt'],reverse=True) if not (a['url'] in seen or seen.add(a['url']))]
  write('news.json',{'updatedAt':stamp,'sources':sources,'unavailableSources':failed,'articles':articles})
 else:print('Keeping previous news snapshot. All sources unavailable.')
 try:
  games=json.loads(get('https://www.freetogame.com/api/games'))
  if not isinstance(games,list) or not games:raise ValueError('Invalid free games catalog')
  rows=[g for g in games if isinstance(g,dict) and isinstance(g.get('id'),int) and g.get('title') and https(g.get('thumbnail',''))]
  if not rows:raise ValueError('No usable games')
  write('free-games.json',{'updatedAt':stamp,'source':'FreeToGame','url':'https://www.freetogame.com/api-doc','games':rows})
 except Exception as error:print(f'Keeping previous free games snapshot ({type(error).__name__}).')
 if not (ROOT/'data/news.json').exists() or not (ROOT/'data/free-games.json').exists():raise SystemExit('First refresh must produce both feeds.')
if __name__=='__main__':main()
