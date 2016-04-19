函数式编程中重要的几个函数：`map`，`reduce`，`filter`在Python 2，Python 3，Java 7，Java 8中的实现。

##  Python 2

### `map`

1.  直接使用列表展开

    ```python
    print [_ * _ for _ in [1, 2, 3]]
    ```
    
    输出：
    
    ```python
    [1, 4, 9]
    ```
    
    如果想对多个列表使用`map`操作可以借助`zip`：
    
    ```python
    print [i + j for (i, j) in zip([1, 2, 3], [4, 5, 6])]
    ```
    
    输出：
    
    ```python
    [5, 7, 9]
    ```

1.  用`map`函数：

    ```python
    print map(lambda a, b: a + b, [1, 2, 3], [4, 5, 6])
    ```
    
    输出：
    
    ```python
    [5, 7, 9]
    ```

### `filter`

1.  使用带条件的列表展开：

    ```python
    print [_ for _ in [1, 2, 3] if _ > 2]
    ```
    
    输出：
    
    ```python
    [3]
    ```

2.  用`filter`函数：

    ```python
    print filter(lambda a: a > 2, [1, 2, 3])
    ```
    
    输出：
    
    ```python
    [3]
    ```
    
### `reduce`

```python
print reduce(lambda a, b: a + b, [1, 2, 3], 100)
```

输出：

```python
106
```

## Python 3

Python 3与Python 2差异不大，除了`reduce`函数不再是Build-in函数，而是移到了`functools`包中。


## Java 7

在Java 7中，这些功能主要是通过`Guava`实现的，以操作对象为`Iterator`举例。

### `map`

使用`Iterators.transform`：

```java
System.out.println(Lists.newArrayList(Iterators.transform(Arrays.asList(1, 2, 3).iterator(),
        new Function<Integer, Integer>() {
            @Override
            public Integer apply(Integer input) {
                return input * input;
            }
        })));
```

输出：

```java
[1, 4, 9]
```

### `filter`

使用`Iterators.filter`：

```java
System.out.println(Lists.newArrayList(Iterators.filter(Arrays.asList(1, 2, 3).iterator(),
        new Predicate<Integer>() {
            @Override
            public boolean apply(Integer input) {
                return input > 2;
            }
        })));
```

输出：

```
[3]
```

### `reduce`

`reduce`功能`Guava`没有提供，需要自己来实现：

```java
public class Reduce {

    public interface Function<T, R> {
        R apply(T t, R r);
    }

    public static <T, R> R reduce(final Iterator<? extends T> iterator, final R begin,
                                  final Function<? super T, R> function) {
        R ret = begin;
        while (iterator.hasNext()) {
            ret = function.apply(iterator.next(), ret);
        }

        return ret;
    }
}
```

例子：

```java
System.out.println(Reduce.reduce(Arrays.asList(1, 2, 3).iterator(), 10,
        new Reduce.Function<Integer, Integer>() {
            public Integer apply(Integer integer, Integer integer2) {
                return integer + integer2;
            }
        }));
```

输出：

```java
16
```

### `reduce`多列表版（`zip`）:

在Python中，reduce操作可以支持多个输入列表，在Java 7 中可以自己实现(我管这种叫`zip`，不过不同于Python 2中Build-in的`zip`)。

先把Java 8中的`BiFunction`抄过来：

```java
public interface BiFunction<T, U, R> {
    R apply(T t, U u);
}
```

然后实现：

```java
public class ZipJ7 {
    public static <T, U, R> Iterator<R> zip(final Iterator<? extends T> iteratorT, final Iterator<? extends U> iteratorU,
                                            final BiFunction<? super T, ? super U, ? extends R> function) {

        return new Iterator<R>() {
            @Override
            public boolean hasNext() {
                return iteratorT.hasNext() && iteratorU.hasNext();
            }

            @Override
            public R next() {
                return function.apply(iteratorT.next(), iteratorU.next());
            }
        };
    }
}
```
    
例子：

```java
System.out.println(Lists.newArrayList(ZipJ7.zip(Arrays.asList(1l, 2l, 3l).iterator(),
        Lists.newArrayList(4l, 5l, 6l).iterator(),
        new BiFunction<Long, Long, Long>() {
            @Override
            public Long apply(Long aLong, Long aLong2) {
                return aLong * aLong2;
            }
        })));
```

输出：

```java
[4, 10, 18]
```

## Java 8

Java 8中内置了一些操作，以操作对象为`Stream`举例。

### `map`

使用`Stream.map`:

```java
System.out.println(Stream.of(1l, 2l, 3l).map(t -> t * t).collect(Collectors.toList()));
```

输出：

```java
[1, 4, 9]
```

### `filter`

使用`Stream.filter`:

```java
System.out.println(Stream.of(1l, 2l, 3l).filter(t -> t > 2).collect(Collectors.toList()));
```

输出：

```java
[3]
```
    
### `reduce`

使用`Stream.reduce`:

```java
System.out.println(Stream.of(1, 2, 3).reduce(0l, (aLong, integer) -> aLong + integer, (aLong, aLong2) -> aLong + aLong2));
```

输出：

```java
6
```

### `zip`

这个操作在Java 8中不存在，可以自己实现，不过构建`Stream`比构建`Iterator`要复杂一些：

```java
public class Zip {
    public static <T, U, R> Stream<R> zip(final Stream<? extends T> streamT, final Stream<? extends U> streamU,
                                          final BiFunction<? super T, ? super U, ? extends R> biFunction) {
        Objects.requireNonNull(biFunction);
        Objects.requireNonNull(streamT);
        Objects.requireNonNull(streamU);

        Spliterator<? extends T> spliteratorT = streamT.spliterator();
        Spliterator<? extends U> spliteratorU = streamU.spliterator();

        // Zipping looses DISTINCT and SORTED characteristics
        int characteristics = spliteratorT.characteristics() & spliteratorU.characteristics() &
                ~(Spliterator.DISTINCT | Spliterator.SORTED);

        long zipSize = ((characteristics & Spliterator.SIZED) != 0)
                ? Math.min(spliteratorT.getExactSizeIfKnown(), spliteratorU.getExactSizeIfKnown())
                : -1;

        Iterator<T> iteratorT = Spliterators.iterator(spliteratorT);
        Iterator<U> iteratorU = Spliterators.iterator(spliteratorU);
        Iterator<R> iteratorR = new Iterator<R>() {
            @Override
            public boolean hasNext() {
                return iteratorT.hasNext() && iteratorU.hasNext();
            }

            @Override
            public R next() {
                return biFunction.apply(iteratorT.next(), iteratorU.next());
            }
        };

        Spliterator<R> split = Spliterators.spliterator(iteratorR, zipSize, characteristics);
        return (streamT.isParallel() || streamU.isParallel())
                ? StreamSupport.stream(split, true)
                : StreamSupport.stream(split, false);
    }
}
```

例子：

```java
System.out.println(Zip.zip(Stream.of(1l, 2l, 3l), Stream.of(4l, 5l, 6l), (aLong, aLong2) -> aLong + aLong2)
        .collect(Collectors.toList()));
```

输出：

```java
[5, 7, 9]
```

Example of abuse:

![](/media/pic/1.pic.jpg)

## PHP

PHP 与 Python 差异不大：

```php
<? php
$call = function($_){
    $_();
};

$call(function(){
    $array = array(1, 2, 3, 4);

    array_walk($array, function(&$_){
        $_ *= $_;
    });

    var_dump($array);
});

$call(function(){
    $array = array(1, 2, 3, 4);

    $array = array_filter($array, function($_){
        return $_ > 1;
    });

    var_dump($array);
});

$call(function(){
    $array = array(1, 2, 3, 4);

    $sum = array_reduce($array, function($a, $b){
        return $a + $b;
    }, 0);

    var_dump($sum);
});
```

输出：

```
array(4) {
  [0]=>
  int(1)
  [1]=>
  int(4)
  [2]=>
  int(9)
  [3]=>
  int(16)
}
array(3) {
  [1]=>
  int(2)
  [2]=>
  int(3)
  [3]=>
  int(4)
}
int(10)
array(2) {
  [2]=>
  int(3)
  [3]=>
  int(4)
}
```
