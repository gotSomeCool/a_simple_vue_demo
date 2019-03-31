function defineReactive(data,key,val){
    observe(val);//递归所有子属性
    var dep=new Dep();
    Object.defineProperty(data,key,{
        enumerable:true,
        configurable:true,
        get:function () {
            if(Dep.target){  //判断是否需要添加订阅者
                dep.addSub(Dep.target); //添加订阅者
            }

            return val;
        },
        set:function(newVal){
            if(val===newVal) return;

            val=newVal;
            console.log('Property '+key+' now is listening,value is "'+newVal.toString()+'"');
            dep.notify(); //如果数据变化,通知所有订阅者
        }
    });

}
Dep.target=null;

function observe(data){
    if(!data||typeof data!=='object'){
        return;
    }
    Object.keys(data).forEach(function (key) {
        defineReactive(data,key,data[key]);
    });
}

function Dep(){
    this.subs=[];
}
Dep.prototype={
    addSub:function (sub) {
        this.subs.push(sub);
    },
    notify:function () {
        this.subs.forEach(function (sub) {
            sub.update();
        })
    }
};

function Watcher(vm,exp,cb) {
    this.cb=cb;
    this.vm=vm;
    this.exp=exp;
    this.value=this.get();
}
Watcher.prototype={
    update:function () {
        this.run();
    },
    run:function () {
        var value=this.vm.data[this.exp];
        var oldVal=this.value;
        if(value!==oldVal){
            this.value=value;
            this.cb.call(this.vm,value,oldVal);
        }
    },
    get:function () {
        Dep.target=this;
        var value=this.vm.data[this.exp];
        Dep.target=null;
        return value;

    }
};


function selfVue(options) {
    var self=this;
    this.data=options.data;
    this.methods=options.methods;

    Object.keys(this.data).forEach(function (key) {
        self.proxyKeys(key);
    });
    observe(this.data);
    new Compile(options.el,this);
    options.mounted.call(this);
}
selfVue.prototype={
    proxyKeys:function (key) {
        var self=this;
        Object.defineProperty(this,key,{
            enumerable:false,
            configurable:true,
            get:function proxyGetter() {
                return self.data[key];
            },
            set:function proxySetter(newVal) {
                self.data[key]=newVal;
            }
        })
    }
}

