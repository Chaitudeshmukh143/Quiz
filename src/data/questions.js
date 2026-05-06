export const questions = [
  {
    id: 1,
    prompt: "What will be the output?",
    code: `class A {
    void show() {
        System.out.print("A ");
    }
}

class B extends A {
    void show() {
        System.out.print("B ");
    }
}

public class Test {
    public static void main(String[] args) {
        A obj = new B();
        obj.show();
        ((A)obj).show();
    }
}`,
    options: ["A A", "B B", "A B", "Compilation Error"],
    answer: "B B"
  },
  {
    id: 2,
    prompt: "Which concept is represented here?",
    code: "A obj = new B();",
    options: ["Encapsulation", "Upcasting", "Downcasting", "Abstraction"],
    answer: "Upcasting"
  },
  {
    id: 3,
    prompt: "What is the output?",
    code: `class Parent {
    Parent() {
        System.out.print("P ");
    }
}

class Child extends Parent {
    Child() {
        System.out.print("C ");
    }
}

public class Main {
    public static void main(String[] args) {
        Child c = new Child();
    }
}`,
    options: ["P", "C", "P C", "Runtime Error"],
    answer: "P C"
  },
  {
    id: 4,
    prompt: "Which keyword is used to access parent class variables?",
    options: ["this", "final", "super", "static"],
    answer: "super"
  },
  {
    id: 5,
    prompt: "What will happen?",
    code: `final class A {
}

class B extends A {
}`,
    options: ["Runs Successfully", "Runtime Error", "Compilation Error", "Warning Only"],
    answer: "Compilation Error"
  },
  {
    id: 6,
    prompt: "What is the output?",
    code: `class A {
    static void test() {
        System.out.print("A ");
    }
}

class B extends A {
    static void test() {
        System.out.print("B ");
    }
}

public class Main {
    public static void main(String[] args) {
        A obj = new B();
        obj.test();
    }
}`,
    options: ["A", "B", "A B", "Compilation Error"],
    answer: "A"
  },
  {
    id: 7,
    prompt: "Which OOP concept hides implementation details?",
    options: ["Inheritance", "Abstraction", "Polymorphism", "Constructor"],
    answer: "Abstraction"
  },
  {
    id: 8,
    prompt: "What is the output?",
    code: `class A {
    A() {
        System.out.print("A ");
    }

    A(int x) {
        this();
        System.out.print(x + " ");
    }
}

public class Main {
    public static void main(String[] args) {
        new A(5);
    }
}`,
    options: ["5 A", "A 5", "A A 5", "Compilation Error"],
    answer: "A 5"
  },
  {
    id: 9,
    prompt: "Which method belongs to Object class?",
    options: ["wait()", "notify()", "toString()", "All of these"],
    answer: "All of these"
  },
  {
    id: 10,
    prompt: "What is the output?",
    code: `class A {
    void show() {
        System.out.print("A ");
    }
}

class B extends A {
    void show() {
        super.show();
        System.out.print("B ");
    }
}

public class Main {
    public static void main(String[] args) {
        new B().show();
    }
}`,
    options: ["A", "B", "A B", "B A"],
    answer: "A B"
  },
  {
    id: 11,
    prompt: "Which keyword prevents inheritance?",
    options: ["static", "final", "private", "super"],
    answer: "final"
  },
  {
    id: 12,
    prompt: "What is the output?",
    code: `class Test {
    static {
        System.out.print("Static ");
    }

    {
        System.out.print("Instance ");
    }

    Test() {
        System.out.print("Constructor ");
    }

    public static void main(String[] args) {
        new Test();
    }
}`,
    options: [
      "Constructor Instance Static",
      "Static Instance Constructor",
      "Instance Static Constructor",
      "Compilation Error"
    ],
    answer: "Static Instance Constructor"
  },
  {
    id: 13,
    prompt: "Which concept allows one method to have many forms?",
    options: ["Encapsulation", "Polymorphism", "Abstraction", "Inheritance"],
    answer: "Polymorphism"
  },
  {
    id: 14,
    prompt: "What is the output?",
    code: `class A {
    int x = 50;
}

class B extends A {
    int x = 100;

    void display() {
        A a = this;
        System.out.print(a.x);
    }
}

public class Main {
    public static void main(String[] args) {
        new B().display();
    }
}`,
    options: ["50", "100", "Compilation Error", "Runtime Error"],
    answer: "50"
  },
  {
    id: 15,
    prompt: "What is the output?",
    code: `interface A {
    default void show() {
        System.out.print("A ");
    }
}

class B implements A {
}

public class Main {
    public static void main(String[] args) {
        new B().show();
    }
}`,
    options: ["A", "B", "Compilation Error", "Runtime Error"],
    answer: "A"
  },
  {
    id: 16,
    prompt: "Can constructors be overridden?",
    options: ["Yes", "No", "Only static constructors", "Only final constructors"],
    answer: "No"
  },
  {
    id: 17,
    prompt: "What is the output?",
    code: `class A {
    static int x = 10;
}

class B extends A {
    static int x = 20;
}

public class Main {
    public static void main(String[] args) {
        A a = new B();
        System.out.print(a.x);
    }
}`,
    options: ["10", "20", "Compilation Error", "Runtime Error"],
    answer: "10"
  },
  {
    id: 18,
    prompt: "Which method cannot be overridden?",
    options: ["Instance Method", "Static Method", "Abstract Method", "Public Method"],
    answer: "Static Method"
  },
  {
    id: 19,
    prompt: "What is the output?",
    code: `class A {
    void show() {
        System.out.print("A ");
    }
}

class B extends A {
    void show(int x) {
        System.out.print("B ");
    }
}

public class Main {
    public static void main(String[] args) {
        A a = new B();
        a.show();
    }
}`,
    options: ["A", "B", "Compilation Error", "Runtime Error"],
    answer: "A"
  },
  {
    id: 20,
    prompt: "Which OOP principle is achieved using private variables and public methods?",
    options: ["Polymorphism", "Abstraction", "Encapsulation", "Inheritance"],
    answer: "Encapsulation"
  },
  {
    id: 21,
    prompt: "What is the output?",
    code: `class A {
    A() {
        System.out.print("A ");
    }
}

class B extends A {
    {
        System.out.print("IIB ");
    }

    B() {
        System.out.print("B ");
    }
}

public class Main {
    public static void main(String[] args) {
        new B();
    }
}`,
    options: ["A IIB B", "IIB A B", "A B IIB", "Compilation Error"],
    answer: "A IIB B"
  },
  {
    id: 22,
    prompt: "Java supports multiple inheritance using:",
    options: ["Classes", "Objects", "Interfaces", "Constructors"],
    answer: "Interfaces"
  },
  {
    id: 23,
    prompt: "What is the output?",
    code: `interface A {
    int x = 10;
}

public class Main implements A {
    public static void main(String[] args) {
        System.out.print(x);
    }
}`,
    options: ["10", "0", "Compilation Error", "Runtime Error"],
    answer: "10"
  },
  {
    id: 24,
    prompt: "What will happen?",
    code: `abstract class A {
    abstract void show();
}

class B extends A {
}`,
    options: ["Runs Successfully", "Runtime Error", "Compilation Error", "Warning"],
    answer: "Compilation Error"
  },
  {
    id: 25,
    prompt: "What is the output?",
    code: `class A {
    void show() {
        System.out.print("A ");
    }
}

class B extends A {
    @Override
    void show() {
        System.out.print("B ");
    }
}

public class Main {
    public static void main(String[] args) {
        A obj = new B();
        obj.show();
    }
}`,
    options: ["A", "B", "A B", "Compilation Error"],
    answer: "B"
  },
  {
    id: 26,
    prompt: "Which keyword is used for inheritance?",
    options: ["import", "implements", "extends", "package"],
    answer: "extends"
  },
  {
    id: 27,
    prompt: "What is the output?",
    code: `class A {
    int x = 5;
}

class B extends A {
    int x = 10;

    void show() {
        System.out.print(super.x);
    }
}

public class Main {
    public static void main(String[] args) {
        new B().show();
    }
}`,
    options: ["5", "10", "Compilation Error", "Runtime Error"],
    answer: "5"
  },
  {
    id: 28,
    prompt: "Which binding occurs in method overriding?",
    options: ["Early Binding", "Static Binding", "Dynamic Binding", "Compile-time Binding"],
    answer: "Dynamic Binding"
  },
  {
    id: 29,
    prompt: "What is the output?",
    code: `class Parent {
    void msg() {
        System.out.print("Parent ");
    }
}

class Child extends Parent {
    void msg() {
        System.out.print("Child ");
    }
}

public class Main {
    public static void main(String[] args) {
        Parent p = new Child();
        p.msg();
    }
}`,
    options: ["Parent", "Child", "Compilation Error", "Runtime Error"],
    answer: "Child"
  },
  {
    id: 30,
    prompt: "What is the output?",
    code: `class A {
    static {
        System.out.print("A ");
    }
}

class B extends A {
    static {
        System.out.print("B ");
    }
}

public class Main {
    public static void main(String[] args) {
        new B();
    }
}`,
    options: ["A B", "B A", "A", "Compilation Error"],
    answer: "A B"
  }
];
