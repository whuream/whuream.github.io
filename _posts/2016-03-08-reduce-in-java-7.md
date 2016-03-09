    public static <F, T> T reduce(final Iterator<F> iterator,
                                  final T begin,
                                  final Function<? super F, T> function) {
        T ret = begin;
        while (iterator.hasNext()) {
            ret = function.apply(iterator.next(), ret);
        }

        return ret;
    }

    public interface Function<F, T> {

        T apply(F f, T t);
    }


Examples:

Accumulating lists:

    System.out.println(CollectionUtil.reduce(Lists.newArrayList(1, 2, 3).iterator(), 10,
            new CollectionUtil.Function<Integer, Integer>() {
        public Integer apply(Integer integer, Integer integer2) {
            return integer + integer2;
        }
    }));

Output:

    16

Concatenating lists:

    List<ArrayList<Long>> listList = Lists.newArrayList(Lists.newArrayList(1l, 2l), Lists.newArrayList(2l, 3l));
    List<Long> longs = CollectionUtil.reduce(listList.iterator(), new ArrayList<Long>(),
            new CollectionUtil.Function<ArrayList<Long>, ArrayList<Long>>() {
        public ArrayList<Long> apply(ArrayList<Long> longs, ArrayList<Long> longs2) {
            longs2.addAll(longs);
            return longs2;
        }
    });

    System.out.println(JSON.toJSONString(longs));

Output:

    [1,2,2,3]

Example of abuse:

![](../media/pic/1.pic.jpg)
