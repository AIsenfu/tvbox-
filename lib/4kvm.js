        var rule= {
            title: '测试',
            host: 'https://www.4kvm.org', // homeUrl:'/',https://www.4kvm.org/xssearch?q=%E8%B6%85%E7%BA%A7&f=_all&p=2
            url: '/fyclass/page/fypage',
            searchUrl: '/xssearch?q=**&f=_all&p=fypage',
            searchable: 2,//是否启用全局搜索,
            quickSearch: 0,//是否启用快速搜索,
            filterable: 0,//是否启用分类筛选,
            headers: {//网站的请求头,完整支持所有的,常带ua和cookies
                'User-Agent': 'MOBILE_UA', // "Cookie": "searchneed=ok"
            },
            class_parse: '.menu-index-container&&ul&&li;a&&Text;a&&href;/(\\d+)',
			CATE_EXCLUDE:'影片下载',
            play_parse: true,
            lazy: common_lazy,
            limit: 6,
            double: false, // 推荐内容是否双层定位
            推荐: '.items featured;div&&article;img&&alt;img&&src;.icon-star2&&Text;a&&href',
            一级: 'body a.module-poster-item.module-item;a&&title;.lazyload&&data-original;.module-item-note&&Text;a&&href',
            二级: {
                title: 'h1&&Text;.module-info-tag-link:eq(-1)&&Text',
                img: '.lazyload&&data-original||data-src||src',
                desc: '.module-info-item:eq(-2)&&Text;.module-info-tag-link&&Text;.module-info-tag-link:eq(1)&&Text;.module-info-item:eq(2)&&Text;.module-info-item:eq(1)&&Text',
                content: '.module-info-introduction&&Text',
                tabs: '.module-tab-item',
                lists: '.module-play-list:eq(#id) a',
                tab_text: 'div--small&&Text',
            },
            搜索: 'body .module-item;.module-card-item-title&&Text;.lazyload&&data-original;.module-item-note&&Text;a&&href;.module-info-item-content&&Text',
        }
