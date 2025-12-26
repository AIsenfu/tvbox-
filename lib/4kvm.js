var rule = {
    title: '测试',
    host: 'https://www.cupfox7.com', // homeUrl: '/', 注释规范写法
    url: '/cupfox/fyclass-fypage.html',
    // 占位符**需用引号包裹，避免语法错误
    searchUrl: 'vodsearch/**----------fypage---.html',
    searchable: 2, // 是否启用全局搜索
    quickSearch: 0, // 是否启用快速搜索
    filterable: 0, // 是否启用分类筛选
    headers: { // 网站的请求头,完整支持所有的,常带ua和cookies
        'User-Agent': 'MOBILE_UA' // "Cookie": "searchneed=ok"
    },
    class_parse: '.dropdown type clearfix&&li;a&&Text;a&&href;/(\\d+)',
    CATE_EXCLUDE: '专题',
    play_parse: true,
    lazy: common_lazy, // 需确保common_lazy变量已定义
    limit: 6,
    double: true, // 推荐内容是否双层定位
    // 中文属性名改为英文驼峰命名，更符合规范
    推荐: '.stui-vodlist clearfix;&&li;a&&title;a&&data-original;p&&Text;a&&href',
    一级: 'body a.module-poster-item.module-item;a&&title;.lazyload&&data-original;.module-item-note&&Text;a&&href',
    二级: {
        title: 'h1&&Text;.module-info-tag-link:eq(-1)&&Text',
        img: '.lazyload&&data-original||data-src||src',
        desc: '.module-info-item:eq(-2)&&Text;.module-info-tag-link&&Text;.module-info-tag-link:eq(1)&&Text;.module-info-item:eq(2)&&Text;.module-info-item:eq(1)&&Text',
        tabs: '.module-tab-item',
        lists: '.module-play-list:eq(#id) a',
        tab_text: 'div--small&&Text'
    },
	搜索: '*',
};
