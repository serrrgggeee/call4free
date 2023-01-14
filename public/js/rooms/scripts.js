const scripts_dev = [
    {name: 'constant.js', async: false, defer: true, path: '/js/'},
    {name: 'custom_config.js', async: false, defer: true,path: '/js/'}, 
    {name: 'helpers/fetch.js', async: false, defer: true,path: '/js/'},
    {name: 'core/index.js', async: false, defer: true,path: '/js/'},
    {name: 'rooms/method.js ', async: false, defer: true,path: '/js/'},
    {name: 'mixins/date_mixins.js', async: false, defer: true,path: '/js/'},
    {name: 'rooms/data.js ', async: false, defer: true,path: '/js/'},
    {name: 'rooms/user.js', async: false, defer: true,path: '/js/'},
    {name: 'mixins/user.js', async: false, defer: true,path: '/js/'},
    {name: 'socket_loader.js', async: false, defer: true,path: '/js/'},
    {name: 'helpers/logger.js ', async: false, defer: true,path: '/js/'},
    {name: 'core/directive.js', async: false, defer: true,path: '/js/'},
    {name: 'rooms/rooms.js', async: false, defer: true,path: '/js/'},
    {name: 'rooms/init.js', async: false, defer: true,path: '/js/'},
    {name: 'loader.js', async: false, defer: true,path: '/js/'},

]

const scripts_prod = [
    {name: 'ziprooms.js', async: false, defer: true,path: '/js/'},
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

