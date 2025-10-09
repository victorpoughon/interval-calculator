## What is this?

This is a calculator that works over _unions of intervals_ rather than just real
numbers. It is an implementation of [Interval Union
Arithmetic](https://www.ime.usp.br/~montanhe/unions.pdf).

You can use it to represent uncertainty:

    ➤ 50 * (10 + [-1, 1])
    [450, 550]

You can also compute more complex interval expressions, using the
interval union operator `U`:

    ➤ ( [5, 10] U [15, 16] ) / [10, 100]
    [0.05, 1.6]

Operations can result in disjoint unions of intervals:

    ➤ 1 / [-2, 1]
    [-∞, -0.5] U [1, +∞]
    ➤ tan([pi/3, 2*pi/3])
    [-∞, -1.732] U [1.732, +∞]

In full precision mode, you can use it as a regular calculator, and
obtain interval results that are guaranteed to contain the true value,
despite floating point precision issues:

    ➤ 0.1 + 0.2
    [0.29999999999999993, 0.3000000000000001]

## Syntax

|            | Syntax <!--                 --> | Examples                                              |
| ---------: | ------------------------------- | ----------------------------------------------------- |
|   Interval | `[a, b]`                        | `[0.5, 0.6]`                                          |
|      Union | `[a, b] U [c, d]`               | `[0, 1] U [5, 6]`                                     |
| Arithmetic | `+ - * / ^`                     | `➤ 10 / ([-2, 1] * 2)`<br>`[-∞, -2.5] U [5, +∞]`      |
|  Functions | `function(...)`                 | `➤ log10([1, 10000])`<br>`[0, 4]`                     |
|  Constants | `name`                          | `➤➤ pi`<br>`[3.1415926535897927, 3.1415926535897936]` |

## Supported Functions

|                   | Function                    | Examples                                                |
| ----------------: | :-------------------------- | :------------------------------------------------------ |
|         Constants | `inf`, `∞`,<br>`pi`, `e` | `➤ [-inf, 0] * [-inf, 0]`<br>`[0, +∞]`                  |
|       Lower bound | `lo(A)`                     | `➤ lo([1, 2])`<br>`[1, 1]`                              |
|       Upper bound | `hi(A)`                     | `➤ hi([1, 2])`<br>`[2, 2]`                              |
|              Hull | `hull(A)`                   | `➤ hull([1, 2] U [99, 100])`<br>`[1, 100]`              |
|    Absolute value | `abs(A)`                    | `➤ abs([-10, 5])`<br>`[0, 10]`                          |
|       Square root | `sqrt(A)`                   | `➤ sqrt([9, 49])`<br>`[3, 7]`                           |
| Natural logarithm | `log(A)`                    | `➤ log([0, 1])`<br>`[-∞, 0]`                            |
|  Logarithm base 2 | `log2(A)`                   | `➤ log2([64, 1024])`<br>`[6, 10]`                       |
| Logarithm base 10 | `log10(A)`                  | `➤ log10([0.0001, 1])`<br>`[-4, 0]`                     |
|       Exponential | `exp(A)`                    | `➤ exp([-∞, 0] U [1, 2])`<br>`[0, 1] U [2.718, 7.389]`  |
|            Cosine | `cos(A)`                    | `➤ cos([pi/3, pi])`<br>`[-1, 0.5]`                      |
|              Sine | `sin(A)`                    | `➤ sin([pi/6, 5*pi/6])`<br>`[0.5, 1]`                   |
|           Tangent | `tan(A)`                    | `➤ tan([pi/3, 2*pi/3])`<br>`[-∞, -1.732] U [1.732, +∞]` |
|           Minimum | `min(A, B)`                 | `➤ min([1, 2], [0, 6])`<br>`[0, 2]`                     |
|           Maximum | `max(A, B)`                 | `➤ max([0, 10], [5, 6])`<br>`[5, 10]`                   |

## Full Precision Mode

Outward rounding is implemented over IEEE 754 double precision floats
(javascript\'s number type), so result intervals are guaranteed to
contain the true value that would be obtained by computing the same
expression over the reals with infinite precision. For example, try the
[famous](https://0.30000000000000004.com/) sum `0.1 + 0.2` in the
calculator. Interval arithmetic computes an interval that is guaranteed
to contain `0.3`, even though `0.3` is not representable as a double
precision float.

When full precision mode is enabled:

-   Numbers input by the user are interpreted as the smallest interval that
    contains the IEEE 754 value closest to the input decimal representation but
    where neither bounds are equal to it
-   Output numbers are displayed with all available decimal digits

When full precision mode is disabled:

-   Numbers input by the user are interpreted as the degenerate interval (width
    zero) where both bounds are equal to the IEEE 754 value closest to the input
    decimal representation
-   Output numbers are displayed with a maximum of 4 decimal digits

## Bugs

While I've been very careful, I'm sure there are still some bugs in the calculator.
Please [report any issue on
GitHub](https://github.com/victorpoughon/interval-calculator).

## Open Source

[Interval Calculator](https://github.com/victorpoughon/interval-calculator) and
[not-so-float](https://github.com/victorpoughon/not-so-float) (the
engine powering the calculator) are open-source. If you you like my open-source
work, please consider [sponsoring me on
GitHub](https://github.com/sponsors/victorpoughon). Thank you&nbsp;❤️
