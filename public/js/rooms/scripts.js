const scripts_prod = [
    {name: 'ziprooms.js', async: false, defer: true,path: '/js/'},
]
let scripts;
if (typeof DEV === 'undefined' || DEV === null) {
    scripts = scripts_prod;
} else {
    scripts = scripts_rooms_dev;
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

