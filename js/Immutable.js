class List {
    add(element) {
        return new Cons(element, this);
    }
    isEmpty() {
        return this instanceof Nil;
    }
    map(fn) {
        return this instanceof Nil ? this : new Cons(fn(this.head), this.tail.map(fn));
    }
    get(index) {
        return this.toArray()[index];
    } 
    toArray(arr) {
        if(!arr) return this.toArray([]);
        if(this instanceof Nil) return arr;
        arr.push(this.head);
        return this.tail.toArray(arr);
    }
    static empty() {
        return new Nil()
    }
}

class Nil extends List {
    constructor() {
        super();
    }
}

class Cons extends List {
    constructor(head, tail) {
        super();
        this.head = head;
        this.tail = tail;
    }
}

class Map {
    constructor(lookup) {
        this.lookup = lookup;
    }
    
    add(key, value) {
        const self = this;
        return new Map(function (lkey){
            if(key === lkey) {
                return value;
            } else {
               return self.lookup(lkey);
            }
        })
    }
    
    static empty() {
        return new Map((key) => null);
    }
}

module.exports = {List: List, Map: Map};