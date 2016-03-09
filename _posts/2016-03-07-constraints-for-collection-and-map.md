1\. ElementMin:

constraint:

    @Retention(RetentionPolicy.RUNTIME)
    @Target({ METHOD, FIELD, ANNOTATION_TYPE, CONSTRUCTOR, PARAMETER })
    @Constraint(validatedBy = ElementMinValidator.class)
    @Documented
    public @interface ElementMin {
        String message() default "{javax.validation.constraints.Min.message}";
    
        Class<?>[] groups() default { };
    
        Class<? extends Payload>[] payload() default { };
    
        /**
         * @return value the element must be higher or equal to
         */
        double value();
    }

validator:

    public class ElementMinValidator implements ConstraintValidator<ElementMin, Object> {
        private BigDecimal value;
    
        @Override
        public void initialize(ElementMin constraintAnnotation) {
            this.value = BigDecimal.valueOf(constraintAnnotation.value());
        }
    
        private Boolean isValidCollection(Collection collection){
            for(Object item: collection){
                BigDecimal itemValue = new BigDecimal(item.toString());
    
                if(itemValue.compareTo(this.value) == -1){
                    return false;
                }
            }
            return true;
        }
    
        @Override
        public boolean isValid(Object value, ConstraintValidatorContext context) {
            if(value == null){
                return true;
            }
            if(value instanceof Collection){
                return isValidCollection((Collection)value);
            }
            if(value instanceof Map){
                return isValidCollection(((Map) value).values());
            }
    
            return false;
        }
    }

2\. ElementNotNull:

constraint:

    @Retention(RetentionPolicy.RUNTIME)
    @Target({ METHOD, FIELD, ANNOTATION_TYPE, CONSTRUCTOR, PARAMETER })
    @Constraint(validatedBy = ElementNotNullValidator.class)
    @Documented
    public @interface ElementNotNull {
        String message() default "{javax.validation.constraints.NotNull.message}";
    
        Class<?>[] groups() default {};
    
        Class<? extends Payload>[] payload() default{};
    }

validator:

    public class ElementNotNullValidator implements ConstraintValidator<ElementNotNull, Object>{
    
        @Override
        public void initialize(ElementNotNull constraintAnnotation) {
    
        }
    
        private boolean isValidCollection(Collection value){
            for(Object item: value){
                if(item == null){
                    return false;
                }
            }
            return true;
        }
    
        @Override
        public boolean isValid(Object value, ConstraintValidatorContext context) {
            if(value == null){
                return true;
            }
    
            if (value instanceof Collection) {
                return isValidCollection((Collection) value);
            } else
                return value instanceof Map && isValidCollection(((Map) value).values());
        }
    }

3\. SecondsFuture:

constraint:

    @Retention(RetentionPolicy.RUNTIME)
    @Target({ METHOD, FIELD, ANNOTATION_TYPE, CONSTRUCTOR, PARAMETER })
    @Constraint(validatedBy = SecondsFutureValidator.class)
    @Documented
    public @interface SecondsFuture {
        String message() default "{javax.validation.constraints.Future.message}";
    
        Class<?>[] groups() default { };
    
        Class<? extends Payload>[] payload() default { };
    
    }

validator:

    public class SecondsFutureValidator implements ConstraintValidator<SecondsFuture, Object> {
    
        @Override
        public void initialize(SecondsFuture constraintAnnotation) {
        }
    
        @Override
        public boolean isValid(Object value, ConstraintValidatorContext context) {
            if (value == null){
                return true;
            }
    
            return Long.valueOf(value.toString()).compareTo(
                    context.unwrap(HibernateConstraintValidatorContext.class).getTimeProvider().getCurrentTime()) == 1;
        }
    }

Example:

    public static class Store{

        @ElementMin(value = 10)
        @ElementNotNull
        public List<Long> prices = Lists.newArrayList(100l, 1l, 2l);

        @ElementNotNull
        public List<String> name = Lists.newArrayList("car", "", null);

        @SecondsFuture
        public Long shipTime = 1l;
    }

    @Test
    public void test(){
        System.out.println(Joiner.on("\n").join(Iterators.transform(
                Validation.buildDefaultValidatorFactory().getValidator().validate(new Store()).iterator(),
                new Function<ConstraintViolation<Store>, String>() {
                    @Override
                    public String apply(ConstraintViolation<Store> input) {
                        return String.format("%s %s %s",
                                input.getPropertyPath(), JSON.toJSON(input.getInvalidValue()), input.getMessage());
                    }
                })));

    }

OutPut:

    prices [100,1,2] must be greater than or equal to 10.0
    name ["car","",null] may not be null
    shipTime 1 must be in the future
