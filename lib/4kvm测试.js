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
        { type_id: '', type_name: '*****全部' },
        { type_id: 1, type_name: '*****分类1' },
        { type_id: 2, type_name: '*****分类2' },
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
    // 请求首页数据，根据实际站点API修改
    const link = await request(HOST + '*****');
    // 解析数据，根据实际返回格式修改
    const html = link.match(/\((.*?)\);/)[1];
    const data = JSON.parse(html).data;
    let videos = _.map(data.items, (it) => {
        return {
            vod_id: it.*****,
            vod_name: it.*****,
            vod_pic: it.*****,
            vod_remarks: it.***** || '',
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
    // 请求分类数据，根据实际站点API修改
    const link = await request(HOST + '*****' + tid + '*****' + pg + '*****');
    // 解析数据，根据实际返回格式修改
    const html = link.match(/\((.*?)\);/)[1];
    const data = JSON.parse(html).data;
    let videos = _.map(data.items, (it) => {
        return {
            vod_id: it.*****,
            vod_name: it.*****,
            vod_pic: it.*****,
            vod_remarks: it.***** || '',
        }
    });
    // 计算总页数
    const pgCount = pg * 30 > data.totalCount ? parseInt(pg) : parseInt(pg) + 1;
    return JSON.stringify({
        page: parseInt(pg),
        pagecount: pgCount,
        limit: 30,
        total: data.totalCount,
        list: videos,
    })
}

/**
 * 获取视频详情
 * @param {string} id - 视频ID
 * @returns {string} - JSON字符串，包含视频详情和播放地址
 */
async function detail(id) {
    const vod = {
        vod_id: id,
        vod_remarks: '',
    };
    // 构建播放地址列表
    const playlist = ['*****' + '$' + HOST + '*****' + id];
    vod.vod_play_from = "*****";
    vod.vod_play_url = playlist.join('#');
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
    const html = await request(id);
    const $ = load(html);
    // 解析播放地址，根据实际页面结构修改
    const pvideo = $("*****[*****]");
    const purl = pvideo[0].attribs['*****'];
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
    // 构建搜索URL，根据实际站点修改
    const link = HOST + "*****" + wd;
    const html = await request(link);
    const $ = load(html);
    // 解析搜索结果，根据实际页面结构修改
    const list = $("*****").find("*****>*****").filter(function () {
        return $(this).find("*****").length > 0;
    });
    let videos = _.map(list, (it) => {
        const a = $(it).find("a:first")[0];
        const img = $(it).find("*****:first")[0];
        const tt = $(it).find("*****:first")[0];
        const remarks = $(it).find("*****")[1];
        return {
            vod_id: a.attribs.href.replace(/.*?\/(.*)/g, '$1'),
            vod_name: tt.children[0].data,
            vod_pic: img.attribs["src"],
            vod_remarks: remarks ? remarks.children[0].data || "" : "",
        };
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
