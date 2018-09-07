import {observable, action} from 'mobx';

class TreeStore {
    constructor(rootStore) {
        this.rootStore = rootStore;
    }

    @observable treeData = [{
        name: 'parent1',
        nodeId: '1',
        nodeType: 'ROOT',
        canDeploy: true,
        privilege: '7',
        parentNodeId: null,
        children: [
            {
                name: 'parent2',
                nodeId: '2',
                nodeType: 'GROUP',
                canDeploy: true,
                parentNodeId: '1',
                privilege: '0',
                children: [
                    {
                        name: 'leaf1',
                        nodeId: '3',
                        parentNodeId: '2',
                        nodeType: 'GROUP',
                        canDeploy: true,
                        children: [],
                        privilege: '7'
                    },
                    {
                        name: 'leaf2',
                        nodeId: '4',
                        parentNodeId: '2',
                        nodeType: 'BUSINESS',
                        canDeploy: false,
                        children: [],
                        privilege: '7'
                    },
                    {
                        name: 'leaf3',
                        nodeId: '5',
                        parentNodeId: '2',
                        privilege: '7',
                        nodeType: 'TEAM',
                        canDeploy: true,
                        children: []
                    }
                ]
            },
            {
                name: 'parent3',
                nodeId: '6',
                parentNodeId: '1',
                nodeType: 'GROUP',
                canDeploy: true,
                privilege: '7',
                children: [
                    {
                        name: 'leaf4',
                        nodeId: '7',
                        parentNodeId: '6',
                        privilege: '7',
                        nodeType: 'GROUP',
                        children: []
                    },
                    {
                        name: 'leaf5',
                        nodeId: '8',
                        parentNodeId: '6',
                        nodeType: 'BUSINESS',
                        privilege: '7',
                        children: []
                    },
                    {
                        name: 'leaf6',
                        nodeId: '9',
                        parentNodeId: '6',
                        nodeType: 'TEAM',
                        privilege: '0',
                        children: []
                    }
                ]
            },
        ]
    }];

    /*更新树*/
    @action updateTree(treeData) {
        this.treeData = treeData;
    }
}

export default TreeStore;