`javax.validation.constraints`中提供了针对基本类型参数的取值检查，但是没有针对列表的检查。

1.  `ElementMin`

    constraint:
    
    ```java
    @Retention(RetentionPolicy.RUNTIME)
    @Target({METHOD, FIELD, ANNOTATION_TYPE, CONSTRUCTOR, PARAMETER})
    @Constraint(validatedBy = ElementMinValidator.class)
    @Documented
    public @interface ElementMin {
        String message() default "{javax.validation.constraints.Min.message}";
    
        Class<?>[] groups() default {};
    
        Class<? extends Payload>[] payload() default {};
    
        /**
         * @return value the element must be higher or equal to
         */
        String value();
    }
    ```

    validator:

    ```java
    public class ElementMinValidator implements ConstraintValidator<ElementMin, Object> {
        private BigDecimal value;
    
        @Override
        public void initialize(ElementMin constraintAnnotation) {
            this.value = new BigDecimal(constraintAnnotation.value());
        }
    
        private Boolean isValidCollection(Collection collection) {
            for (Object item : collection) {
                BigDecimal itemValue = new BigDecimal(item.toString());
    
                if (itemValue.compareTo(this.value) == -1) {
                    return false;
                }
            }
            return true;
        }
    
        @Override
        public boolean isValid(Object value, ConstraintValidatorContext context) {
            if (value == null) {
                return true;
            }
            if (value instanceof Collection) {
                return isValidCollection((Collection) value);
            }
            if (value instanceof Map) {
                return isValidCollection(((Map) value).values());
            }
    
            return false;
        }
    }
    ```

1.  `ElementNotNull`

    constraint:

    ```java
    @Retention(RetentionPolicy.RUNTIME)
    @Target({METHOD, FIELD, ANNOTATION_TYPE, CONSTRUCTOR, PARAMETER})
    @Constraint(validatedBy = ElementNotNullValidator.class)
    @Documented
    public @interface ElementNotNull {
        String message() default "{javax.validation.constraints.NotNull.message}";
    
        Class<?>[] groups() default {};
    
        Class<? extends Payload>[] payload() default {};
    }
    ```

    validator:

    ```java
    public class ElementNotNullValidator implements ConstraintValidator<ElementNotNull, Object> {
    
        @Override
        public void initialize(ElementNotNull constraintAnnotation) {
    
        }
    
        private boolean isValidCollection(Collection value) {
            for (Object item : value) {
                if (item == null) {
                    return false;
                }
            }
            return true;
        }
    
        @Override
        public boolean isValid(Object value, ConstraintValidatorContext context) {
            if (value == null) {
                return true;
            }
    
            if (value instanceof Collection) {
                return isValidCollection((Collection) value);
            } else
                return value instanceof Map && isValidCollection(((Map) value).values());
        }
    }
    ```

1.  `SecondsFuture`

    constraint:

    ```java
    @Retention(RetentionPolicy.RUNTIME)
    @Target({METHOD, FIELD, ANNOTATION_TYPE, CONSTRUCTOR, PARAMETER})
    @Constraint(validatedBy = SecondsFutureValidator.class)
    @Documented
    public @interface SecondsFuture {
        String message() default "{javax.validation.constraints.Future.message}";
    
        Class<?>[] groups() default {};
    
        Class<? extends Payload>[] payload() default {};
    
    }
    ```

    validator:

    ```java
    public class SecondsFutureValidator implements ConstraintValidator<SecondsFuture, Object> {
    
        @Override
        public void initialize(SecondsFuture constraintAnnotation) {
        }
    
        @Override
        public boolean isValid(Object value, ConstraintValidatorContext context) {
            if (value == null) {
                return true;
            }
    
            return Long.valueOf(value.toString()).compareTo(
                    context.unwrap(HibernateConstraintValidatorContext.class).getTimeProvider().getCurrentTime()) == 1;
        }
    }
    ```

Example:

```java
public class ConstraintTest {

    public static class Students {
        @ElementMin(value = "0")
        private List<Long> ages;

        @ElementNotNull
        private List<String> names;

        @SecondsFuture
        private Long future;

        public List<Long> getAges() {
            return ages;
        }

        public void setAges(List<Long> ages) {
            this.ages = ages;
        }

        public List<String> getNames() {
            return names;
        }

        public void setNames(List<String> names) {
            this.names = names;
        }

        public Long getFuture() {
            return future;
        }

        public void setFuture(Long future) {
            this.future = future;
        }

        public Students(List<Long> ages, List<String> names, Long future) {
            this.ages = ages;
            this.names = names;
            this.future = future;
        }

        public Students() {

        }
    }

    public static String validate(Object object) {
        Set<ConstraintViolation<Object>> result = Validation.buildDefaultValidatorFactory().getValidator().validate(object);

        return result.stream().map(t -> String.format("field %s value %s illegal: %s", t.getPropertyPath().toString(),
                JSON.toJSON(t.getInvalidValue()), t.getMessage())).collect(Collectors.joining("\n"));

    }

    @Test
    public void test() {
        Students students = new Students(Arrays.asList(1l, 2l, -1l), Arrays.asList("", "SuTong", null), 100l);

        System.out.println(validate(students));
    }
}
```

OutPut:

```
field names value ["","SuTong",null] illegal: may not be null
field future value 100 illegal: must be in the future
field ages value [1,2,-1] illegal: must be greater than or equal to 0
```
