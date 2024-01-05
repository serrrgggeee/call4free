const scripts_prod = [
    {name: 'ziprooms.js', async: false, defer: true,path: '/js/'},
]
DEV=1
let scripts = scripts_rooms_dev;
if (typeof DEV === 'undefined' || DEV === null) {
    scripts = scripts_prod;
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