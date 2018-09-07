export const removeSubmenuSelected = function () {  
    document.querySelectorAll('.submenu-selected').forEach((domNode) => {
        domNode.classList.remove('submenu-selected');
    });
};

export const addSubmenuSelected = function (domEvent) {  
    document.querySelectorAll('.submenu-selected').forEach((domNode) => {
        domNode.classList.remove('submenu-selected');
    });
    domEvent.currentTarget.classList.add('submenu-selected');
}