if (typeof Object.assign !== 'function') {
    Object.assign = function () {
        let target = arguments[0];
        for (let i = 1; i < arguments.length; i++) {
            let source = arguments[i];
            for (let key in source) {
                if (Object.prototype.hasOwnProperty.call(source, key)) {
                    target[key] = source[key];
                }
            }
        }
        return target;
    };
}

// 通用免嗅探播放
let common_lazy = `js:
  let html = request(input);
  let hconf = html.match(/r player_.*?=(.*?)</)[1];
  let json = JSON5.parse(hconf);
  let url = json.url;
  if (json.encrypt == '1') {
    url = unescape(url);
  } else if (json.encrypt == '2') {
    url = unescape(base64Decode(url));
  }
  if (/(\.m3u8|\.mp4|\.m4a|\.mp3)/.test(url)) {
    input = {
      parse: 0,
      jx: 0,
      url: url,
    };
  } else {
    input = url && url.startsWith('http') && tellIsJx(url) ? {parse:0,jx:1,url:url}:input;
  }`;

function getMubans() {
    const mubanDict = { // 模板字典
        "4kvm": {
            title: '4k影视',
            host: 'https://www.4kvm.org',
            url: '/movies/',
            searchUrl: '/xssearch?s=**',
            searchable: 2,
            quickSearch: 0,
            filterable: 0,
            headers: {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
            },
            play_parse: true,
            lazy: common_lazy,
            limit: 6,
            double: true,
            class_parse: '.top-nav li;a&&Text;a&&href;.*/(.*?)/',
            推荐: 'article.item;#featured-titles .item;a&&title;a&&src;.data span&&Text;a&&href',
            一级: 'article.item;a&&title;.poster img&&src;.data span&&Text;a&&href',
            二级: {
                title: 'h1[itemprop="name"]&&Text;span[itemprop="dateCreated"]&&Text',
                img: 'img[itemprop="image"]&&src',
                desc: 'span[itemprop="dateCreated"]&&Text',
                content: 'div[itemprop="description"]&&Text',
                tabs: '.play-tabs a',
                lists: '.play-list:eq(#id) li',
            },
            搜索: '.result-item article;a&&title;.image img&&src;.details .title a&&Text;a&&href',
        },
    };
    return JSON.parse(JSON.stringify(mubanDict));
}

var mubanDict = getMubans();
var muban = getMubans();
export default {muban, getMubans};
