Let $q_1, q_2, \dots, q_n$ be distinct prime numbers, and let

$$
a = \prod_{i=1}^{n} q_i^{\alpha_i}, \quad b = \prod_{i=1}^{n} q_i^{\beta_i}
$$

where $\alpha_i \geq 0$ and $\beta_i \geq 0$ are integers. Then:

$$
\gcd(a, b) = \prod_{i=1}^{n} q_i^{\min(\alpha_i, \beta_i)}, \quad
\text{lcm}(a, b) = \prod_{i=1}^{n} q_i^{\max(\alpha_i, \beta_i)}
$$

---

Not sure why the book doesn't throw in $\gcd$ and $\text{lcm}$ before the parentheses... it makes it a lot more complicated. Not sure the lcm technical definition. Informally, it's the smallest number both can divide into without a remainder.

But I would like to flex the gcd definition I have from my abstract algebra class:

Let $a, b \in \mathbb{Z}$ and suppose that $a$ and $b$ aren't both zero. The greatest common divisor of $a$ and $b$, denoted as $\gcd(a,b)$ is defined as follows:

1. $\gcd(a,b) > 0$
2. $\gcd(a,b) \mid a$ (note: this reads gcd(a,b) divides a. Meaning $a \div \gcd(a, b) \in \mathbb{Z}$)
3. $\gcd(a,b) \mid b$
4. If $d$ is a common divisor of $a$ and $b$, then $d \leq \gcd(a,b)$

---

Some quick background in case you didn't know:  
$\min(a, b)$ chooses the smaller number between $a$ and $b$.  
$\max(a, b)$ chooses the larger number.

---

### Theorem 12 Example:

$$
\begin{aligned}
a &= 2^3 \cdot 3^2 \cdot 5^1, \quad b = 2^1 \cdot 3^3 \cdot 7^1 \\
\text{So the prime bases are:} \quad &q_1 = 2, \ q_2 = 3, \ q_3 = 5, \ q_4 = 7 \\
\text{Now compute } \min(\alpha_i, \beta_i): \\
\text{For } q = 2: \quad &\min(3, 1) = 1 \\
\text{For } q = 3: \quad &\min(2, 3) = 2 \\
\text{For } q = 5: \quad &\min(1, 0) = 0 \\
\text{For } q = 7: \quad &\min(0, 1) = 0 \\
\text{Therefore, } \gcd(a, b) &= 2^1 \cdot 3^2 = 18
\end{aligned}
$$

---

$$
\begin{aligned}
\text{For } q = 2: \quad &\max(3, 1) = 3 \\
\text{For } q = 3: \quad &\max(2, 3) = 3 \\
\text{For } q = 5: \quad &\max(1, 0) = 1 \\
\text{For } q = 7: \quad &\max(0, 1) = 1 \\
\\
\text{lcm}(a, b) &= 2^3 \cdot 3^3 \cdot 5^1 \cdot 7^1 \\
&= 8 \cdot 27 \cdot 5 \cdot 7 \\
&= 7560
\end{aligned}
$$

---

I recently learned:  
$\gcd(a, b) \cdot \text{lcm}(a, b) = a \cdot b$

If you're feeling voracious, prove it or find the logic behind it. Call me and teach me why.
