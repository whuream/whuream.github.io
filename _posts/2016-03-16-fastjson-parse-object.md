1.  目标类不是泛型，使用方法：
    
    ```java
    public static <T> T parseObject(String text, Class<T> clazz)
    ```
    如：

    ```java
    Car car = JSON.parseObject(string, Car.class);
    ```
    
    或者使用方法：

    ```java
    public static <T> T parseObject(String text, TypeReference<T> type, Feature... features)
    ```
    
    如：

    ```java
    Car car = JSON.parseObject(string, new TypeReference<Car>(){});
    ```

    或者使用方法：

    ```java
    public static <T> T parseObject(String input, Type clazz, Feature... features)
    ```
    如：

    ```java
    Car car = JSON.parseObject(string, new TypeToken<Car>(){}.getType());
    ```
    
1.  如果目标类是泛型，使用方法：

    ```java
    public static <T> T parseObject(String text, TypeReference<T> type, Feature... features)
    ```
    
    如：
    
    ```java
    List<Car> cars = JSON.parseObject(string, new TypeReference<List<Car>>(){});
    ```

    或者使用方法：

    ```java
    public static <T> T parseObject(String input, Type clazz, Feature... features)
    ```
    
    如：

    ```java
    List<Car> cars = JSON.parseObject(string, new TypeToken<List<Car>>(){}.getType());
    ```


其中，`new TypeToken<List<Car>>(){}`与`new TypeReference<List<Car>>(){}`原理类似，通过构造匿名子类来继承特定的泛型模板，
然后在子类中使用。

```java
Type[] types = ((ParameterizedType) getClass().getGenericSuperclass()).getActualTypeArguments;
```

来获取子类中的泛型模板名称。


而`Guava`中的`TypeToken`的功能更为强大，可以动态构造Type:

使用方法：

```java
public final <X> TypeToken<T> where(TypeParameter<X> typeParam, Class<X> typeArg)
```

或：

```java
public final <X> TypeToken<T> where(TypeParameter<X> typeParam, TypeToken<X> typeArg)
```

如：

```java
public static <K, V> Type mapType(TypeToken<K> k, Class<V> v) {
    return new TypeToken<Map<K, V>>() {}
            .where(new TypeParameter<K>() {}, k)
            .where(new TypeParameter<V>() {}, v).getType();
}

@Test
public void typeTokenTest(){
    Type type = mapType(new TypeToken<List<Car>>() {}, Car.class);

    System.out.println(type);
}
```
    
    

输出：

```
java.util.Map<java.util.List<me.sutong.java.FastjsonTest$Car>, me.sutong.java.FastjsonTest$Car>
```

