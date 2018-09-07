import TreeStore from './treeStore';

class RootStore {
    constructor() {
        /*辅助UI元素的展示*/
        this.treeStore = new TreeStore(this);
    }
}

export default new RootStore();