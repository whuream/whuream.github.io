用来快速检查数据库的返回值。

```java
public class DbRetCheck {

    private static class DatabaseException extends RuntimeException {
        private static final long serialVersionUID = -8768685827964066080L;

        DatabaseException(String msg) {
            super(msg);
        }
    }

    public static <T extends Comparable<T>> void dbRetException(T ret, T expected, CompareTypeEnum compareTypeEnum) {
        Boolean checkStatus = false;

        if (compareTypeEnum.equals(CompareTypeEnum.EQUAL)) {
            checkStatus = ret.equals(expected);
        } else if (compareTypeEnum.equals(CompareTypeEnum.GREATER)) {
            checkStatus = ret.compareTo(expected) == 1;
        } else if (compareTypeEnum.equals(CompareTypeEnum.LESS)) {
            checkStatus = ret.compareTo(expected) == -1;
        } else if (compareTypeEnum.equals(CompareTypeEnum.GREATER_EQUAL)) {
            checkStatus = ret.compareTo(expected) > -1;
        } else if (compareTypeEnum.equals(CompareTypeEnum.LESS_EQUAL)) {
            checkStatus = ret.compareTo(expected) < 1;
        }

        String msg = String.format("db operation failed, ret = %s, expected %s %s", ret.toString(),
                compareTypeEnum.getValue(), expected.toString());

        if (!checkStatus) {
            throw new DatabaseException(msg);
        }

    }

    public enum CompareTypeEnum {

        EQUAL("="),
        GREATER(">"),
        LESS("<"),
        GREATER_EQUAL(">="),
        LESS_EQUAL("<=");

        CompareTypeEnum(String value) {
            this.value = value;
        }

        private String value;

        public String getValue() {
            return value;
        }

        public void setValue(String value) {
            this.value = value;
        }
    }
}
```

Example:

```java
Long dbRet = 1l;

DbRetCheck.dbRetException(dbRet, 2l, DbRetCheck.CompareTypeEnum.EQUAL);
```

Output:

```
me.sutong.java.tools.DbRetCheck$DatabaseException: db operation failed, ret = 1, expected = 2
	at me.sutong.java.tools.DbRetCheck.dbRetException(DbRetCheck.java:35)
	at me.sutong.java.tools.DbRetCheckTest.testDbRetException(DbRetCheckTest.java:16)
	...
``` 
