1\.如果目标类不是泛型，使用方法：

    public static <T> T parseObject(String text, Class<T> clazz)

如：

    C1 c2 = JSON.parseObject(string, C1.class);

或者使用方法：

    public static <T> T parseObject(String text, TypeReference<T> type, Feature... features)

如：

    C1 c4 = JSON.parseObject(string, new TypeReference<C1>(){});

或者使用方法：

    public static <T> T parseObject(String input, Type clazz, Feature... features)

如：

    C1 c3 = JSON.parseObject(string, new TypeToken<C1>(){}.getType());

2\.如果目标类是泛型，使用方法：

    public static <T> T parseObject(String text, TypeReference<T> type, Feature... features)

如：

    C2<C1> c1C21 = JSON.parseObject(string, new TypeReference<C2<C1>>(){});

或者使用方法：

    public static <T> T parseObject(String input, Type clazz, Feature... features)

如：

    C2<C1> c1C22 = JSON.parseObject(string, new TypeToken<C2<C1>>(){}.getType());


其中，`new TypeToken<C2<C1>>(){}`与`new TypeReference<C2<C1>>(){}`原理类似，通过构造匿名子类来继承特定的泛型模板，然后在子类中使用

    Type[] types = ((ParameterizedType) getClass().getGenericSuperclass()).getActualTypeArguments;

来获取子类中的泛型模板名称。


而`com.google.common.reflect.TypeToken`的功能更为强大，可以动态构造Type:

使用方法：

    public final <X> TypeToken<T> where(TypeParameter<X> typeParam, Class<X> typeArg)

或：

    public final <X> TypeToken<T> where(TypeParameter<X> typeParam, TypeToken<X> typeArg)

如：

    @Test
    public void test4(){
        Type type = mapType(new TypeToken<C2<C1>>(){}, C1.class);
        System.out.println(type);
    }

    static <K, V> Type mapType(TypeToken<K> k, Class<V> v) {
        return new TypeToken<Map<K, V>>() {}
                .where(new TypeParameter<K>() {}, k)
                .where(new TypeParameter<V>() {}, v).getType();
    }

输出：

    java.util.Map<FastJsonTest.FastJsonTest$C2<FastJsonTest$C1>, FastJsonTest$C1>

