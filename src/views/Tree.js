import React from "react";
import { inject, observer } from "mobx-react";
import {addSubmenuSelected, removeSubmenuSelected} from '../utils/common';
import { Menu, Icon, Input } from "antd";
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import '../assets/css/tree.css';
const SubMenu = Menu.SubMenu;

/*组织节点扁平化列表*/
let dataList = [];

/* 父节点列表 */
let parentList = [];

const generateList = (data) => {
    for (let i = 0; i < data.length; i++) {
        const node = data[i];
        const nodeId = node.nodeId;
        dataList.push({nodeId, name: node.name, parentNodeId: node.parentNodeId});
        if (node.children.length > 0) {
            generateList(node.children);
        }
    }
};

const getParentKey = (nodeId, tree) => {
    let parentKey;
    for (let i = 0; i < tree.length; i++) {
        const node = tree[i];
        if (node.children.length > 0) {
            if (node.children.some(item => item.nodeId === nodeId)) {
                parentKey = node.nodeId;
            } else if (getParentKey(nodeId, node.children)) {
                parentKey = getParentKey(nodeId, node.children);
            }
        }
    }
    return parentKey;
};

const getAllParentKey = (parentIds) => {
    if (parentIds.length === 0) {
        return;
    }
    let ids = [];
    parentIds.forEach(item => {
        if (!parentList.includes(item)) {
            parentList.push(item);
        }
        dataList.forEach(node => {
            if (node.nodeId === item) {
                if (node.parentNodeId !== null && !ids.includes(node.parentNodeId)) {
                    ids.push(node.parentNodeId);
                }
            }
        });
    });
    return getAllParentKey(ids);
};

const getDatasetNode = (currentNode) => {
    let current = currentNode;
    while (current.nodeName !== 'LI') {
        current = current.parentNode;
    }
    return current;
};

/*节点自增标示*/
let count = 10;

@inject("rootStore")
@observer
class Tree extends React.Component {
    state = {
        searchValue: "",
        selectedKeys: [],
        openKeys: [],
        rightClickNode: null
    };

    componentDidMount() {
        document.querySelector('.react-contextmenu-wrapper').addEventListener('contextmenu', this.handleRightClick);
    }

    componentWillUnmount() {
        document.querySelector('.react-contextmenu-wrapper').removeEventListener('contextmenu', this.handleRightClick);
    }

    renderIcon = (type, flag) => {
        switch (type) {
            case 'ROOT':
                return (
                    <Icon type="home" style={ flag === 1? {color: '#00EE76'} : {}} />
                );
            case 'GROUP':
                return (
                    <Icon type="usergroup-add" style={ flag === 1? {color: '#00EE76'} : {}} />
                );
            case 'BUSINESS':
                return (
                    <Icon type="bank" style={ flag === 1? {color: '#00EE76'} : {}} />
                );
            case 'LOADING':
            return (
                <Icon type="loading" style={flag === 1? {color: '#00EE76'} : {}}></Icon>
            );
            default:
                return (
                    <Icon type="team" style={ flag === 1? {color: '#00EE76'} : {}} />
                );
        }
    };

    loop = data => data.map(item => {
        let {searchValue} = this.state;
        const index = item.name.indexOf(searchValue);
        const beforeStr = item.name.substr(0, index);
        const afterStr = item.name.substr(index + searchValue.length);
        const title = index > -1 ? (
            <span>
                {this.renderIcon(item.nodeType, searchValue? 1 : 2)}
                {beforeStr}
                <span style={{color: '#00EE76'}}>{searchValue}</span>
                {afterStr}
            </span>
        ) : <span>
                {this.renderIcon(item.nodeType, 2)}
                <span>{item.name}</span>
            </span>;
        if (item.canDeploy) {
            return (
                <SubMenu
                    key={item.nodeId}
                    data-id={item.nodeId}
                    data-privilege={item.privilege}
                    onTitleClick={this.handleTitleClick(item)}
                    title={title}
                >
                    {this.loop(item.children)}
                </SubMenu>
            );
        }
        return (
            <Menu.Item key={item.nodeId} data-id={item.nodeId} data-privilege={item.privilege}>
                {title}
            </Menu.Item>
        );
    });

    handleChange = (e) => {
        const value = e.target.value;
        let {treeData} = this.props.rootStore.treeStore;
        /* 获取包含搜索内容的所有节点key */
        let openKeys = dataList.map((item) => {
            if (item.name.indexOf(value) > -1) {
                return getParentKey(item.nodeId, treeData);
            }
            return null;
        }).filter((item, i, self) => item && self.indexOf(item) === i);
        /* 重置需要展开的父节点id */
        parentList = [];
        /* 将所选中的内容的节点id的全部父节点id写入parentList中 */
        getAllParentKey(openKeys);
        openKeys = parentList;
        this.setState({
            openKeys,
            searchValue: value,
        });
    };

    handleClick = e => {
        /* 每个menuItem绑定点击事件 */
        console.log("click ", e);
    };

    handleOpenChange = (openKeys) => {
        /* 可获取当前所有已经打开面板的key列表 */
        // console.log(openKeys);
        this.setState({
            openKeys
        });
    };

    handleAsyncLoadData = (treeNode) => {
        let nodeTypeTemp = treeNode.nodeType;
        treeNode.nodeType = 'LOADING';
        return new Promise((resolve) => {
            if (treeNode.children.length > 0) {
                treeNode.nodeType = nodeTypeTemp;
                resolve();
                return;
            }
            setTimeout(() => {
                treeNode.nodeType = nodeTypeTemp;
                treeNode.children = [
                    { name: 'Child' + count, nodeId: (count++ + ''), parentNodeId: treeNode.nodeId, nodeType: 'GROUP', children: [], canDeploy: true, privilege: 7 },
                    { name: 'Child' + count, nodeId: (count++ + ''), parentNodeId: treeNode.nodeId, nodeType: 'GROUP', children: [], canDeploy: false, privilege: 7 },
                ];
                resolve();
            }, 2000);
        });
    };

    handleTitleClick = (treeNode) => ({key, domEvent}) => {
        // console.log(key);
        addSubmenuSelected(domEvent);
        this.setState({
            selectedKeys: []
        });
        this.handleAsyncLoadData(treeNode);
    };

    handleSelect = ({ item, key, selectedKeys }) => {
        /* 只有menuItem才能选中，选中会执行该函数 */
        console.log(item, key, selectedKeys);
        removeSubmenuSelected();
        this.setState({
            selectedKeys
        });
    };

    loopAdd = (node, data) => {
        data.forEach((item) => {
            if (node.parentNodeId === item.nodeId) {
                console.log(item);
                item.canDeploy = true;
                item.children.push(node);
                /* this.setState({
                    openKeys: this.state.openKeys.concat(item.nodeId)
                }); */
                return 1;
            } else {
                if (item.children.length > 0) {
                    return this.loopAdd(node, item.children);
                }
            }
        });
    };

    loopEdit = (node, data) => {
        data.forEach((item) => {
            if (node.nodeId === item.nodeId) {
                Object.keys(node).forEach(key => {
                    if (key !== 'children') {
                        item[key] = node[key];
                    }
                });
                return 1;
            } else {
                if (item.children.length > 0) {
                    return this.loopEdit(node, item.children);
                }
            }
        });
    };

    loopDelete = (parentId, nodeId, data) => {
        console.log(parentId, nodeId);
        data.forEach((item) => {
            if (parentId === item.nodeId) {
                let index = 0;
                item.children.forEach((child, key) => {
                    if (child.nodeId === nodeId) {
                        index = key;
                    }
                });
                // this.props.rootStore.accountStore.updateSelectedNode(item);
                item.children.splice(index, 1);
                return 1;
            } else {
                if (item.children.length > 0) {
                    return this.loopDelete(parentId, nodeId, item.children);
                }
            }
        });
    };

    /* 右键点击处理 */
    handleMenuItemClick = (e, data) => {
        e.preventDefault();
        let {treeData} = this.props.rootStore.treeStore;
        // console.log(data);
        switch (data.status) {
            case 0:
                /* 添加节点 */
                this.loopAdd({
                    name: 'Child' + count,
                    nodeId: (count++ + ''),
                    parentNodeId: data.nodeId, 
                    nodeType: 'GROUP', 
                    children: [],
                    privilege: '1', 
                    canDeploy: true
                }, treeData);
                break;
            case 1: 
                this.loopEdit({
                    name: 'edit' + count,
                    nodeId: data.nodeId,
                    parentNodeId: data.nodeId, 
                    nodeType: 'GROUP', 
                    children: [],
                    privilege: '1', 
                    canDeploy: true
                }, treeData);
                break;
            case 2:
                this.loopDelete('2', data.nodeId, treeData);
                break;
            default:
                return;
        }
        this.setState({
            rightClickNode: null
        });
    };

    handleRightClick = (event) => {
        // console.log(event.target);
        let dataNode = getDatasetNode(event.target);
        console.log(dataNode);
        console.log(dataNode.dataset);
        this.setState({
            rightClickNode: dataNode.dataset
        });
        // console.log(dataNode.dataset);
    };

    render() {
        let { treeData } = this.props.rootStore.treeStore;
        let {selectedKeys, searchValue, openKeys, rightClickNode} = this.state;
        /* 节点扁平化处理 */
        dataList = [];
        generateList(treeData);
        return (
            <div className="tree">
                <Input style={{marginBottom: '50px'}} placeholder="search value" value={searchValue} onChange={this.handleChange} />
                <ContextMenuTrigger id="context-menu" holdToDisplay={1000}>
                    <Menu
                        onClick={this.handleClick}
                        style={{ width: "100%" }}
                        onOpenChange={this.handleOpenChange}
                        mode="inline"
                        theme="dark"
                        openKeys={openKeys}
                        selectedKeys={selectedKeys}
                        onSelect={this.handleSelect}
                        inlineIndent={24}
                    >
                        {this.loop(treeData)}
                    </Menu>
                </ContextMenuTrigger>
                <ContextMenu id="context-menu">
                    <MenuItem
                        onClick={this.handleMenuItemClick}
                        disabled={rightClickNode? (['0', '1'].includes(rightClickNode.privilege)) : false}
                        data={{nodeId: rightClickNode? rightClickNode.id : '', status: 0}}
                    >
                        添加
                    </MenuItem>
                    <MenuItem
                        onClick={this.handleMenuItemClick}
                        disabled={rightClickNode? (['0', '1'].includes(rightClickNode.privilege)) : false}
                        data={{nodeId: rightClickNode? rightClickNode.id : '', status: 1}}
                    >
                        编辑
                    </MenuItem>
                    <MenuItem divider />
                    <MenuItem
                        onClick={this.handleMenuItemClick}
                        disabled={rightClickNode? (['0', '1'].includes(rightClickNode.privilege)) : false}
                        data={{nodeId: rightClickNode? rightClickNode.id : '', status: 2}}
                    >
                        删除
                    </MenuItem>
                </ContextMenu>
            </div>
        );
    }
}

export default Tree;