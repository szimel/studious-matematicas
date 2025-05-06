Let $q_1, q_2, \dots, q_n$be distinct prime numbers, and let

$$
a = \displaystyle\prod_{i=1}^{n} q_i^{\alpha_i}, \quad b = \displaystyle\prod_{i=1}^{n} q_i^{\beta_i}
$$

where $\alpha_i \geq 0$ and $\beta_i \geq 0$ are integers. Then:

$$
\gcd(a, b) = \prod_{i=1}^{n} q_i^{\min(\alpha_i, \beta_i)}, \quad
\text{lcm}(a, b) = \prod_{i=1}^{n} q_i^{\max(\alpha_i, \beta_i)}
$$

---

Not sure why the book doesn't throw in gcd and lcm... Kinda dumb. Some quick refreshers just in case:

1. gcd(a,b) = greatest common divisor, meaning largest number that divides a abd b with no remainder
2. lcm(a,b) = least common multiple, meaning the smallest number that can be divided by a and b with no remainder.
3. $\min(a, b)$ chooses the smaller number between $a$ and $b$.
4. $\max(a, b)$ chooses the larger number.

---

### Theorem 12 Example:

So let's put a real example to the definitions. Let's take two numbers, say 420 and 490. Then:

$$
\begin{aligned}
	420 &= 10 \cdot 42 = 5 \cdot 2 \cdot 7 \cdot 2 \cdot 3 = 2^2 \cdot 7 \cdot 3\\
	294 &= 10 \cdot 49 = 2 \cdot 5 \cdot 7 \cdot 7 = 2 \cdot 7^2 \cdot 5 \\
\end{aligned}
$$

We've now broken down the numbers into their prime factorizations. Now let's go back to our definition. In the context of gcd(420, 490), what would our $q_i$ be? Well it's the prime numbers comprising 420 and 490. What about $\alpha_i$ and $\beta_i$? They're the exponents used to make 420 and 490.

$$
	q_i = \{2, 3, 5, 7\} \\
	\alpha_i = \{2, 1, 0, 1\} \\
	\beta_i = \{1, 0, 2, 1\} \\
$$

So we've kind of made a map of sorts that we are now going to loop through. Note that this bad boy: $\prod$ works the exact same as $\sum$, except with multiplication instead of addition. Let's manually walk through gcd(420, 490) using **Theorem 12**.

$$
	\gcd(420, 490) = \prod_{i=1}^{4} q_i^{\min(\alpha_i, \beta_i)}
$$

$$
	\begin{aligned}
		\textbf{at }i=1:\quad & q_1^{\min(\alpha_1,\beta_1)}
				= 2^{\min(2,1)} = 2^1 = 2,\\
		\textbf{at }i=2:\quad & q_2^{\min(\alpha_2,\beta_2)}
				= 3^{\min(1,0)} = 3^0 = 1,\\
		\textbf{at }i=3:\quad & q_3^{\min(\alpha_3,\beta_3)}
				= 5^{\min(0,2)} = 5^0 = 1,\\
		\textbf{at }i=4:\quad & q_4^{\min(\alpha_4,\beta_4)}
				= 7^{\min(1,1)} = 7^1 = 7.
	\end{aligned}
$$

Putting it all together:

$$
\gcd(420,490)
= 2 \times 1 \times 1 \times 7
= 14.
$$

**lcm** is the exact same, except with max() instead. They're pretty cool and intuitive relationships. I used these definitions a ton in my abstract algebra class - really, **gcd, lcm** are used as building blocks by a lot by other theorems and definitions.

### EXTRA

I recently learned:  
$\gcd(a, b) \cdot \text{lcm}(a, b) = a \cdot b$

If you're feeling voracious, prove it or find the logic behind it. It should be hard to prove... but I bet your intuition can get you close. Call me and teach me why.
