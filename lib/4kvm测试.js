// 导入HTML解析库
import { load, _ } from 'https://github.cnxiaobai.com/https://raw.githubusercontent.com/AIsenfu/tvbox-page/refs/heads/main/lib/cat.js';

// 站点标识
let key = '测试4kvm';
// 站点基础URL
let HOST = 'https://www.4kvm.org/';
// 站点密钥（由配置传入）
let siteKey = '';
// 站点类型（由配置传入）
let siteType = 0;
// 用户代理字符串
const IOS_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1';

/**
 * 网络请求函数
 * @param {string} reqUrl - 请求URL
 * @param {string} agentSp - 可选的用户代理
 * @returns {Promise<string>} - 返回响应内容
 */
async function request(reqUrl, agentSp) {
    let res = await req(reqUrl, {
        method: 'get',
        headers: {
            'User-Agent': agentSp || IOS_UA,
        },
    });
    return res.content
}

/**
 * 初始化函数
 * @param {object} cfg - 配置对象
 */
async function init(cfg) {
    siteKey = cfg.skey;
    siteType = cfg.stype
}

/**
 * 获取首页分类
 * @param {object} filter - 过滤条件
 * @returns {string} - JSON字符串，包含分类列表
 */
async function home(filter) {
    // 分类列表，根据实际站点修改
    const classes = [
        { type_id: '', type_name: '首页' },
        { type_id: 1, type_name: '电影' },
        { type_id: 2, type_name: '电视剧' }
        // 添加更多分类...
    ];
    const filterObj = {};
    return JSON.stringify({
        class: _.map(classes, (cls) => {
            cls.land = 1; // 横屏
            cls.ratio = 1.78; // 宽高比
            return cls;
        }),
        filters: filterObj,
    })
}

/**
 * 获取首页推荐视频
 * @returns {string} - JSON字符串，包含视频列表
 */
async function homeVod() {
    // 请求首页数据
    const html = await request(HOST);
    // 解析HTML
    const $ = load(html);
    
    // 提取推荐视频
    let videos = [];
    
    // 提取首页轮播图部分的视频
    $("article.item").each(function() {
        const a = $(this).find(".image a");
        const img = $(this).find(".image img");
        const title = $(this).find(".data h3.title");
        const year = $(this).find(".data span");
        
        if (a.length && img.length && title.length) {
            const href = a.attr("href");
            // 从URL中提取ID
            const match = href.match(/\/(movies|tvshows)\/(.*)/);
            if (match && match[2]) {
                const id = match[2];
                videos.push({
                    vod_id: id,
                    vod_name: title.text(),
                    vod_pic: img.attr("src"),
                    vod_remarks: year.text() || '',
                });
            }
        }
    });
    
    // 提取热门推荐部分的视频
    $("#featured-titles .item").each(function() {
        const a = $(this).find("a");
        const img = $(this).find(".poster img");
        const title = $(this).find(".data h3");
        const year = $(this).find(".data span");
        
        if (a.length && img.length && title.length) {
            const href = a.attr("href");
            // 从URL中提取ID
            const match = href.match(/\/(movies|tvshows)\/(.*)/);
            if (match && match[2]) {
                const id = match[2];
                videos.push({
                    vod_id: id,
                    vod_name: title.text(),
                    vod_pic: img.attr("src"),
                    vod_remarks: year.text() || '',
                });
            }
        }
    });
    
    return JSON.stringify({
        list: videos,
    })
}

/**
 * 获取分类视频列表
 * @param {string} tid - 分类ID
 * @param {number} pg - 页码
 * @param {object} filter - 过滤条件
 * @param {object} extend - 扩展参数
 * @returns {string} - JSON字符串，包含视频列表和分页信息
 */
async function category(tid, pg, filter, extend) {
    if (pg <= 0 || typeof pg == 'undefined') pg = 1;
    
    // 构建分类URL
    let categoryUrl;
    if (tid == 1) {
        categoryUrl = HOST + 'movies/';
    } else if (tid == 2) {
        categoryUrl = HOST + 'tvshows/';
    } else {
        categoryUrl = HOST;
    }
    
    // 添加分页
    if (pg > 1) {
        categoryUrl += 'page/' + pg + '/';
    }
    
    // 请求分类数据
    const html = await request(categoryUrl);
    const $ = load(html);
    
    // 提取视频列表
    let videos = [];
    $("article.item").each(function() {
        // 查找图片
        const img = $(this).find(".poster img");
        // 查找标题链接
        const titleA = $(this).find(".data h3 a");
        // 查找年份
        const year = $(this).find(".data span");
        
        if (titleA.length && img.length) {
            const href = titleA.attr("href");
            const title = titleA.text();
            // 从URL中提取ID
            const match = href.match(/\/(movies|tvshows)\/(.*)/);
            if (match && match[2]) {
                const id = match[2];
                videos.push({
                    vod_id: id,
                    vod_name: title,
                    vod_pic: img.attr("src"),
                    vod_remarks: year.text() || '',
                });
            }
        }
    });
    
    // 计算总页数（这里简化处理，实际应该从分页控件中提取）
    const pgCount = 10; // 假设最多10页
    
    return JSON.stringify({
        page: parseInt(pg),
        pagecount: pgCount,
        limit: 30,
        total: videos.length * pgCount,
        list: videos,
    })
}

/**
 * 获取视频详情
 * @param {string} id - 视频ID
 * @returns {string} - JSON字符串，包含视频详情和播放地址
 */
async function detail(id) {
    // 构建详情页URL
    const detailUrl = HOST + 'movies/' + id;
    
    // 请求详情页数据
    const html = await request(detailUrl);
    const $ = load(html);
    
    // 提取视频信息
    const title = $("h1[itemprop='name']").text() || '';
    const poster = $("img[itemprop='image']").attr("src") || '';
    const year = $("span[itemprop='dateCreated']").text() || '';
    
    // 构建播放地址列表
    const playlist = ['点击播放' + '$' + detailUrl];
    
    const vod = {
        vod_id: id,
        vod_name: title,
        vod_pic: poster,
        vod_remarks: year,
        vod_play_from: "4kvm在线",
        vod_play_url: playlist.join('#'),
    };
    
    return JSON.stringify({
        list: [vod],
    });
}

/**
 * 获取播放地址
 * @param {string} flag - 播放源标识
 * @param {string} id - 视频ID或播放地址
 * @param {string} flags - 备用参数
 * @returns {string} - JSON字符串，包含最终播放地址
 */
async function play(flag, id, flags) {
    // 请求详情页或播放页
    const html = await request(id);
    const $ = load(html);
    
    // 尝试从不同位置提取播放地址
    let purl = '';
    
    // 尝试提取iframe中的播放地址
    const iframe = $("iframe[src*='http']");
    if (iframe.length) {
        purl = iframe.attr("src");
    }
    
    // 尝试提取video标签中的播放地址
    if (!purl) {
        const video = $("video[src*='http']");
        if (video.length) {
            purl = video.attr("src");
        }
    }
    
    // 尝试提取包含播放地址的script标签
    if (!purl) {
        $("script").each(function() {
            const scriptContent = $(this).text();
            if (scriptContent.includes('videoSrc') || scriptContent.includes('playUrl')) {
                const match = scriptContent.match(/(videoSrc|playUrl)\s*[:=]\s*["']([^"']+)["']/);
                if (match) {
                    purl = match[2];
                    return false; // 跳出循环
                }
            }
        });
    }
    
    return JSON.stringify({
        parse: 0,
        url: purl,
    });
}

/**
 * 搜索功能
 * @param {string} wd - 搜索关键词
 * @param {boolean} quick - 快速搜索标志
 * @returns {string} - JSON字符串，包含搜索结果
 */
async function search(wd, quick) {
    // 构建搜索URL
    const searchUrl = HOST + "xssearch?s=" + encodeURIComponent(wd);
    
    // 请求搜索结果页
    const html = await request(searchUrl);
    const $ = load(html);
    
    // 解析搜索结果
    let videos = [];
    $("article.item").each(function() {
        const a = $(this).find(".image a");
        const img = $(this).find(".image img");
        const title = $(this).find(".data h3.title");
        const year = $(this).find(".data span");
        
        if (a.length && img.length && title.length) {
            const href = a.attr("href");
            // 从URL中提取ID
            const match = href.match(/\/(movies|tvshows)\/(.*)/);
            if (match && match[2]) {
                const id = match[2];
                videos.push({
                    vod_id: id,
                    vod_name: title.text(),
                    vod_pic: img.attr("src"),
                    vod_remarks: year.text() || '',
                });
            }
        }
    });
    
    return JSON.stringify({
        list: videos,
        land: 1,
        ratio: 1.78,
    });
}

/**
 * 导出所有方法
 * @returns {object} - 包含所有方法的对象
 */
export function __jsEvalReturn() {
    return {
        init: init,
        home: home,
        homeVod: homeVod,
        category: category,
        detail: detail,
        play: play,
        search: search,
    }
}
