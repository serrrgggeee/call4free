const scripts_dev = [
    {name: 'constant.js', async: false, defer: true, path: '/js/'},
    {name: 'custom_config.js', async: false, defer: true,path: '/js/'}, 
    {name: 'room/data.js', async: false, defer: true,path: '/js/'}, 
    {name: 'room/method.js', async: false, defer: true, path: '/js/'}, 
    {name: 'core/index.js', async: false, defer: true, path: '/js/'}, 
    {name: 'mixins/date_mixins.js', async: false, defer: true, path: '/js/'}, 
    {name: 'socket_loader.js', async: false, defer: true, path: '/js/'}, 
    {name: 'room/init.js', async: false, defer: true, path: '/js/'}, 
    {name: 'helpers/logger.js', async: false, defer: true, path: '/js/'},  
    {name: 'helpers/fetch.js', async: false, defer: true, path: '/js/'},  
    {name: 'room/user.js', async: false, defer: true, path: '/js/'}, 
    {name: 'mixins/user.js', async: false, defer: true, path: '/js/'}, 
    {name: 'helpers/debounce.js', async: false, defer: true, path: '/js/'}, 
    {name: 'core/directive.js', async: false, defer: true, path: '/js/'},
    {name: 'mixins/canvas.js', async: false, defer: true, path: '/js/'},
    {name: 'components/remote_video.js', async: false, defer: true, path: '/js/'},
    {name: 'my_cropper.js', async: false, defer: true, path: '/js/'},
    {name: 'loader.js', async: false, defer: true, path: '/js/'},
    {name: 'config.js', async: false, defer: true, path: '/js/'},
    {name: 'core/p2p.js', async: false, defer: true, path: '/js/'},
    {name: 'room/video.js', async: false, defer: true, path: '/js/'},
    {name: 'core/events.js', async: false, defer: true, path: '/js/'},
    {name: 'chat.js', async: false, defer: true, path: '/js/'},
    {name: 'lesson.js', async: false, defer: true, path: '/js/'},
    // {name: 'https://apis.google.com/js/platform.js', async: true, defer: false, path: ''},
]

const scripts_prod = [
    {name: 'ziproom.js', async: false, defer: true,path: '/js/'},
]
let scripts;
if (typeof DEV === 'undefined' || DEV === null) {
    scripts = scripts_prod;
} else {
    scripts = scripts_dev;
}

window.onload = () => {
    for (const [index, element] of scripts.entries()) {
        const newScript = document.createElement("script");
        newScript.src =`${element.path}${element.name}`;
        newScript.async = element.async;
        newScript.defer = element.defer;
        if(element.async) {
        }
        document.body.appendChild(newScript);
    }
}