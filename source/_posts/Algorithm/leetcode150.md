---
title: leetcode150
date: 2026-07-02 13:52:31
tags:
---

## 数组

### 88.合并两个有序数组

> 给你两个按 **非递减顺序** 排列的整数数组 `nums1` 和 `nums2`，另有两个整数 `m` 和 `n` ，分别表示 `nums1` 和 `nums2` 中的元素数目。
>
> 请你 **合并** `nums2` 到 `nums1` 中，使合并后的数组同样按 **非递减顺序** 排列。
>
> **注意：**最终，合并后数组不应由函数返回，而是存储在数组 `nums1` 中。为了应对这种情况，`nums1` 的初始长度为 `m + n`，其中前 `m` 个元素表示应合并的元素，后 `n` 个元素为 `0` ，应忽略。`nums2` 的长度为 `n` 。

💡num1的后n个元素为0，因此cmp后的元素放在后面，这样也不会脏写前面其他的元素。

```python
def merge(self,nums1:List[int], m:int, nums2:List[int],n:int) -> None:
  i,j,k = m-1, n-1, m+n-1
  
  while i>=0 and j>=0:
    if nums1[i] >= nums2[j]:
      nums1[k]=nums1[i]
      i-=1
    else:
      nums1[k]=nums2[j]
      j-=1
    k-=1
    
  while j>=0:
    nums1[k]=nums2[j]
    k-=1
    j-=1
  # 而且也不必再讨论 while i>= 0 的情况，as it is
```

### 27. 移除元素

> 给你一个数组 `nums` 和一个值 `val`，你需要 **[原地](https://baike.baidu.com/item/原地算法)** 移除所有数值等于 `val` 的元素。元素的顺序可能发生改变。然后返回 `nums` 中与 `val` 不同的元素的数量。
>
> 假设 `nums` 中不等于 `val` 的元素数量为 `k`，要通过此题，您需要执行以下操作：
>
> - 更改 `nums` 数组，使 `nums` 的前 `k` 个元素包含不等于 `val` 的元素。`nums` 的其余元素和 `nums` 的大小并不重要。
> - 返回 `k`。

💡方法一：顺延88的思路，本质就是把垃圾放在末尾，但多了一层处理，需要实现知道垃圾的数量。

```python
class Solution:
    def removeElement(self, nums: List[int], val: int) -> int:
        num_val = 0
        for i in range(len(nums)):
            if nums[i] == val:
                num_val += 1

        m=0
        i,j = 0,len(nums)-1
        
        while i < len(nums)-num_val:
            if nums[i] != val:
                i+=1
                continue 
            while j>=0:
                if nums[j] !=  val:
                  # 末尾不是垃圾才换，换完break
                    nums[i],nums[j] = nums[j],nums[i]
                    m+=1
                    j-=1
                    break
                else:
                    j-=1

        return len(nums)-num_val
```

💡方法二：把垃圾放在后面，等价于：把好的放在前面（快慢指针）（保序、最多遍历一次）

```python
def removeElement(self,nums:List[int],val:int) -> int:
  slow = 0
  for fast in range(len(nums)):
    if nums[fast]!=val:
      nums[slow]=nums[fast]
      slow+=1
  return slow
```

💡方法三：方法一的优化

方法一的处理是：只有末尾不是垃圾的时候才换，换完后break。我们可以换成：

只要现在还是垃圾我就一直和末尾的换，直到换到当前不是垃圾。

会死循环吗？不会，因为i越来越大，n越来越小，且他们两个相遇的时候一定是垃圾全部堆积完毕的时候。

```python
def removeElement(self,nums:List[int],val:int) -> int:
  i = 0
  n = len(nums)
  while i < n:
    if nums[i] == val:
      # 发现了垃圾，用末尾的元素把垃圾替换，但是末尾的元素本身可能仍然是垃圾。所以i还不能往前移动。
      nums[i] = nums[n-1]
      n-=1
    else:
      i+=1
```

### 26. 删除有序数组中的重复项

> 给你一个 **非严格递增排列** 的数组 `nums` ，请你**[ 原地](http://baike.baidu.com/item/原地算法)** 删除重复出现的元素，使每个元素 **只出现一次** ，返回删除后数组的新长度。元素的 **相对顺序** 应该保持 **一致** 。然后返回 `nums` 中唯一元素的个数。
>
> 考虑 `nums` 的唯一元素的数量为 `k`。去重后，返回唯一元素的数量 `k`。
>
> `nums` 的前 `k` 个元素应包含 **排序后** 的唯一数字。下标 `k - 1` 之后的剩余元素可以忽略。

💡相对顺序应该保持一致（快慢指针），快指针一路往前勘察条件，慢指针根据快指针勘察内容的条件来判断自己要不要更新。

在这里：

- 快指针勘察的内容是**快指针本身的值**

- 慢指针的更新条件是**快指针是否变成了新的值**

🤔如果涉及相对顺序应该保持一致，就可以考虑快慢指针，重点思考快指针勘察的内容和慢指针更新的条件。

```python
class Solution:
    def removeDuplicates(self, nums: List[int]) -> int:
        i = 0
        for num in nums:
            if i==0 or num>nums[i-1]:
                nums[i] = num
                i+=1
        return i
```

### 80. 删除排序数组中的重复项 II

> 给你一个有序数组 `nums` ，请你**[ 原地](http://baike.baidu.com/item/原地算法)** 删除重复出现的元素，使得出现次数超过两次的元素**只出现两次** ，返回删除后数组的新长度。
>
> 不要使用额外的数组空间，你必须在 **[原地 ](https://baike.baidu.com/item/原地算法)修改输入数组** 并在使用 O(1) 额外空间的条件下完成。

```python
class Solution:
    def removeDuplicates(self, nums: List[int]) -> int:
        n = len(nums)
        if n <= 2:
            return n
        slow,fast = 2,2

        while fast < n:
            if nums[slow-2] != nums[fast]:
                nums[slow] = nums[fast]
                slow +=1
            fast+=1
        return slow
```

💡原地删除/筛选数组元素时，可以把 **nums[0:slow]** 看作已经构造好的**合法结果区**。（注意是从0开始哦，结果区不是只有2个元素的窗口！）

fast 负责扫描原数组中的候选元素 x。

每次判断：
**如果把 x 放入 nums[0:slow]，结果区是否仍然满足要求？**

本题中：

数组有序，如果结果区里已经有两个重复的 `x`，它们**一定在结果区的末尾**。

所以判断**nums[slow - 2] =? nums[fast]**

**Template**

```python
#删除重复项，只允许最多出现k次。
def removeDuplicatesK(nums: List[int], k: int) -> int:
    slow = 0

    for fast in range(len(nums)):
        if slow < k or nums[fast] != nums[slow - k]:
            nums[slow] = nums[fast]
            slow += 1

    return slow
```

### 169. 多数元素

> 给定一个大小为 `n` 的数组 `nums` ，返回其中的多数元素。多数元素是指在数组中出现次数 **大于** `⌊ n/2 ⌋` 的元素。
>
> 你可以假设数组是非空的，并且给定的数组总是存在多数元素。（时间复杂度O(n), 空间复杂度O(1)）

```python
class Solution:
    def majorityElement(self, nums: List[int]) -> int:
        count = 0
        for num in nums:
            if count == 0:
                candidate = num
                count += 1
            else:
                if candidate == num:
                    count += 1
                else:
                    count -= 1
        return candidate 
```

### 189. 轮转数组

> 给定一个整数数组 `nums`，将数组中的元素向右轮转 `k` 个位置，其中 `k` 是非负数。
>
>  
>
> **示例 **
>
> ```
> 输入: nums = [1,2,3,4,5,6,7], k = 3
> 输出: [5,6,7,1,2,3,4]
> 解释:
> 向右轮转 1 步: [7,1,2,3,4,5,6]
> 向右轮转 2 步: [6,7,1,2,3,4,5]
> 向右轮转 3 步: [5,6,7,1,2,3,4]
> ```

```python
# ❌：发现只有第一次反转有作用。难道切片没有传入引用？🤔
def reverse(nums:List[int]) -> None:
    """
    [1,2,3] --> [3,2,1]
    """
    left,right = 0 ,len(nums)-1
    while left<right:
        nums[left],nums[right] = nums[right],nums[left]
        left += 1
        right -= 1

class Solution:
    def rotate(self, nums: List[int], k: int) -> None:
        """
        Do not return anything, modify nums in-place instead.
        """
        n = len(nums)
        k = k%n
        reverse(nums)
        reverse(nums[:k])
        reverse(nums[k:])
```

✍🏻Python切片

✍🏻深浅拷贝

````markdown

---

# Python 切片、深浅拷贝与轮转数组 bug 分析笔记

## 1. 一次轮转数组引发的 bug

**题目：** 给定数组 `nums`，向右轮转 `k` 步（原地修改）。

**错误写法：**
```python
def reverse(nums):
    left, right = 0, len(nums)-1
    while left < right:
        nums[left], nums[right] = nums[right], nums[left]
        left += 1
        right -= 1

class Solution:
    def rotate(self, nums, k):
        n = len(nums)
        k %= n
        reverse(nums)           # 第一步，反转整个数组 ✅
        reverse(nums[:k])       # 第二步，反转前 k 个 ❌ 无效
        reverse(nums[k:])       # 第三步，反转剩余部分 ❌ 无效
```
**出错原因：**  
`nums[:k]` 和 `nums[k:]` 是切片操作，会**创建新的子列表（浅拷贝）**。`reverse` 函数反转的是这个新列表，原数组 `nums` 不受任何影响。  
要原地修改，必须直接操作原列表的片段。

---

## 2. 基础概念：Python 的引用模型

- 变量只是贴在对象上的**标签**。
- 列表里存储的是一根根**指向其他对象的引用（箭头）**。

```
a = [1, 2]
a ──→ [·, ·]
       ｜ ｜
       ↓ ↓
       1  2
```

---

## 3. 浅拷贝与深拷贝

### 3.1 赋值 `=` —— 不是拷贝
`b = a` 只是多贴了一个标签，`b` 和 `a` 是**同一个对象**。

### 3.2 浅拷贝 —— “新瓶装旧酒”
**浅拷贝创建新容器，但内部元素引用与原容器相同。**
- 创建方式：`b = a.copy()`、`b = list(a)`、`b = a[:]`、`copy.copy(a)`
- 图解：
```
a ──→ [·, ·]
       ｜ ｜
       ↓ ↓
       1  2
       ↑ ↑
       ｜ ｜
b ──→ [·, ·]   ← 新容器，但箭头指向相同的 1 和 2
```
- **关键特性：**
  - 修改**不可变元素**（数字、字符串、元组）会断开引用，**不影响原对象**。
  - 修改**可变元素的内部内容**（如嵌套列表的 `append`）会影响原对象，因为两个容器共享同一个内层对象。
  - **替换**可变元素本身（如 `b[0] = something`）则不会影响原对象，只是改变了该位置的引用。

#### 实验对比
```python
a = [[1,2], 3]
b = a[:]            # 浅拷贝

# 情况1：替换 b 的一个元素
b[0] = [100]        # b[0] 指向新列表
print(a[0])         # [1,2]   → a 不受影响

# 情况2：原地修改内层可变对象
b = a[:]            # 重新浅拷贝
b[0].append(999)    # 通过 b 修改共享的内部列表
print(a[0])         # [1, 2, 999]  → a 被连带修改！
```

### 3.3 深拷贝 —— “完全独立”
`copy.deepcopy(a)` 递归复制所有层级的可变对象，新旧对象完全独立。
```python
import copy
a = [[1,2], 3]
c = copy.deepcopy(a)
c[0].append(999)
print(a[0])   # [1,2]  互不影响
```
> 注意：不可变元素（如数字）在深拷贝时可能被复用，但因为没有提供修改方法，行为上仍是独立的。

### 3.4 对比表格

| 操作 | 新容器？ | 内层元素引用 | 修改内层可变对象内容是否影响原对象 |
|------|---------|------------|-------------------------------|
| 赋值 `b = a` | ❌ 同一个对象 | 相同 | 是 |
| 浅拷贝 `a[:]` / `a.copy()` | ✅ 新容器 | 相同 | **是** |
| 深拷贝 `copy.deepcopy(a)` | ✅ 新容器 | 递归复制，全新 | 否 |

---

## 4. 切片深度解析

### 4.1 切片的完整语法
```python
序列[ start : stop : step ]
```
- `start`：起始索引（包含），缺省时由步长方向决定。
- `stop`：结束索引（不包含）。
- `step`：步长，决定取数方向和间隔，**不能为 0**。

### 4.2 步长（step）的正负规则
- **步长为正**：从左向右取，默认 `start=0`，`stop=len(seq)`。
- **步长为负**：从右向左取，默认 `start=-1`（最后一个元素），`stop` 为第一个元素之前（保证包含索引 0）。

**经典反转：**
```python
a = [10, 20, 30, 40, 50]
a[::-1]   # [50, 40, 30, 20, 10]
```
解释：`start` 缺省为最后一个索引，`stop` 缺省为第一个索引之前，`step=-1` 倒序遍历。

### 4.3 步长示例表
```python
a = [10, 20, 30, 40, 50]

a[::2]      # [10, 30, 50]      从索引0隔1取1
a[1::2]     # [20, 40]          从索引1隔1取1
a[::-2]     # [50, 30, 10]      从右向左隔1取1
a[4:1:-1]   # [50, 40, 30]      从索引4到索引1（不含），步长-1
a[:3:2]     # [10, 30]          前三个中步长2
a[3::-1]    # [40, 30, 20, 10]  从索引3向左直到头
```

### 4.4 切片 = 浅拷贝
**任何切片操作（无论步长）都返回一个新列表，元素引用与原列表相同。**
```python
a = [[1,2], 3, 4]
b = a[::2]          # b = [[1,2], 4]
b[0][0] = 999
print(a[0][0])      # 999  → 原列表受影响
```
这正是前面轮转数组 bug 的根本原因。

---

## 5. 切片赋值 —— 原地修改列表的利器

### 5.1 基本用法
```python
nums[start:stop] = 可迭代对象
```
将 `start:stop` 这一段**原地替换**为右侧的内容，直接修改原列表，不创建新列表。

### 5.2 结合步长实现批量替换
右侧元素数量必须与左侧切片选出的数量严格相等。
```python
a = [10, 20, 30, 40, 50]
a[::2] = [100, 200, 300]   # 替换索引0,2,4
print(a)                    # [100, 20, 200, 40, 300]
```
步长为负时同样适用：
```python
a = [10, 20, 30, 40, 50]
a[::-2] = [100, 200, 300]  # 替换索引4,2,0
print(a)                   # [300, 20, 200, 40, 100]
```

### 5.3 利用切片赋值实现部分反转（优雅写法）
```python
def reverse_part(nums, start, end):
    nums[start:end] = nums[start:end][::-1]

# 示例
nums = [1, 2, 3, 4, 5]
reverse_part(nums, 1, 4)   # 原地反转索引1到3
print(nums)                # [1, 4, 3, 2, 5]
```
解释：右侧 `nums[1:4][::-1]` 先取出子列表并反转成新列表 `[4,3,2]`，然后通过切片赋值放回原位置。

---

## 6. 轮转数组的正确解法

### 方案一：带索引范围的 reverse 函数（清晰直观）
```python
def reverse_range(nums, left, right):
    while left < right:
        nums[left], nums[right] = nums[right], nums[left]
        left += 1
        right -= 1

class Solution:
    def rotate(self, nums, k):
        n = len(nums)
        k %= n
        reverse_range(nums, 0, n - 1)
        reverse_range(nums, 0, k - 1)
        reverse_range(nums, k, n - 1)
```

### 方案二：利用切片赋值 + `[::-1]`（简洁 Pythonic）
```python
class Solution:
    def rotate(self, nums, k):
        n = len(nums)
        k %= n
        # 反转整个数组
        nums[:] = nums[::-1]
        # 反转前 k 个
        nums[:k] = nums[:k][::-1]
        # 反转剩余部分
        nums[k:] = nums[k:][::-1]
```
注意：`nums[:] = ...` 也是切片赋值，将整个列表原地替换，效果等同于 `nums.reverse()`。

---

## 7. 核心总结

- **深浅拷贝**：
  - 浅拷贝（`[:]`、`.copy()`）只复制容器，内部元素共享，修改可变元素内容会相互影响。
  - 深拷贝（`copy.deepcopy`）完全独立。
- **切片**：
  - 完整语法 `[start:stop:step]`，是浅拷贝操作。
  - `[::-1]` 是反转全序列的惯用写法。
- **切片赋值**：
  - `seq[slice] = iterable` 是原地修改原序列的重要手段。
  - 配合反转切片可以优雅地实现部分反转。
- **轮转数组**：
  - 错误原因：把切片结果当作原数组传入函数，导致修改丢失。
  - 纠正方法：要么使用带索引范围的 reverse，要么使用切片赋值直接作用于原数组。

````

```python
# 最终解法：
class Solution:
    def rotate(self, nums: List[int], k: int) -> None:
        """
        Do not return anything, modify nums in-place instead.
        """
        n = len(nums)
        k = k%n
        nums[:]=nums[::-1]
        nums[:k]=nums[:k][::-1]
        nums[k:]=nums[k:][::-1]
        
# QA：
# 为什么要写： nums[:k]=nums[:k][::-1] 而不是  nums[:k]=nums[:k:-1]
# 易错点❌：当step为负数的时候，start是从右边开始的，因此[:k:-1]中，缺省的start其实是"len(nums)-1"。
# 所以切片两次写：nums[:k][::-1]
# 如果非要一次切片，那还得计算，可读性也差：nums[:k] = nums[k-1::-1]
```

💡方法二：

- 对k取模标准化：k = k%n
- 轮转的过程中会发现，有部分元素“不会越界”，那么那部分元素的映射关系（记原始位置是i，移动后的位置是j）是
  - j = i + k
- 那么哪些元素会越界？即：i + k >= n ， 这些元素的位置满足
  - j = i + k -n (这类公式麻烦的点在于边界条件，可以直接给一个例子，确定边界条件)
- 因此我们可以：根据元素的位置，直接确定他们的归宿，但是问题在于，元素会被移动后的覆盖。
  - **对于不越界的元素，从后往前遍历**可以至少保证这些元素在被覆盖前已经提前找到了自己的归宿
  - 对于越界的元素没有办法，他们一定会被覆盖，所以提前保存他们的值到一个数组中，最后恢复

```python
class Solution:
    def rotate(self, nums: List[int], k: int) -> None:
      n = len(nums)
      k = k%n
      
      temp = nums[n-k:].copy()
      for i in range(n-k-1,-1,-1):
        nums[i+k] = nums[i]
      for i in range(0,k):
        nums[i] = temp[i]
```

### 121. 买卖股票的最佳时机

> 给定一个数组 `prices` ，它的第 `i` 个元素 `prices[i]` 表示一支给定股票第 `i` 天的价格。
>
> 你只能选择 **某一天** 买入这只股票，并选择在 **未来的某一个不同的日子** 卖出该股票。设计一个算法来计算你所能获取的最大利润。
>
> 返回你可以从这笔交易中获取的最大利润。如果你不能获取任何利润，返回 `0` 。

💡方法一：暴力遍历：

```python
class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        ans = 0
        for i in range(len(prices)):
            for j in range(i + 1, len(prices)):
                ans = max(ans, prices[j] - prices[i])
        return ans
```

暴力法会超时，优化的点在于如何一次遍历就可以知道最大利润？假如遍历时，每次考虑的都是以**今天价格**卖出股票，以**今天之前**的某个时刻买入，所得到的最大利润。**某个时刻**显然是今天之前的**最低买入价格**，而这个最低买入价格是完全可以被O(1)记住的。所以：

```python
class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        min_price = float('inf')
        max_profit = 0 
        for price in prices:
            max_profit = max(max_profit,price - min_price)
            min_price = min(min_price,price)
        return max_profit
```

### 122. 买卖股票的最佳时机 II

> 给你一个整数数组 `prices` ，其中 `prices[i]` 表示某支股票第 `i` 天的价格。
>
> 在每一天，你可以决定是否购买和/或出售股票。你在任何时候 **最多** 只能持有 **一股** 股票。然而，你可以在 **同一天** 多次买卖该股票，但要确保你持有的股票不超过一股。
>
> 返回 *你能获得的 **最大** 利润* 。

💡方法一（贪心）：一天可以同时卖出然后再买入这股股票。那么只要**能赚就赚**就可以得到最大利润。

```python
class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        profit = 0
        for i in range(1,len(prices),1):
            if prices[i] > prices[i-1]:
                profit += prices[i]-prices[i-1]
        return profit
```

但是，假如，同一天只能买或者卖一次，这种方案是否还奏效？

[1,4,6]  4 - 1 = 3  ; 6 - 1= 5... 显然不奏效。

💡方法二（回溯）：每天的操作是：买 or 卖 or 不操作。另外还有：一旦买了就只能卖or不操作，一旦卖了就只能不操作or买入。

```python
class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        self.res = 0
        def dfs(index,status,profit) -> None:
            if index == len(prices):
                self.res = max(self.res, profit)
                return
            # 啥也不干，不买也不卖，维持现状
            dfs(index+1,status,profit)
            if status == 0:
                # 可以买就试试买入的情况。
                dfs(index+1,1,profit-prices[index])
            else:
                # 可以卖就试试卖掉的情况，卖完后profit变多但状态变成0（不可再卖）
                dfs(index+1,0,profit+prices[index])
        dfs(0,0,0)
        return self.res
```

💡方法三（DP）：

**“不知道怎样设计dp数组”**，本质上是因为没有抓住这类**“状态型”DP**问题的核心逻辑。

#### 第一步：抛开数组，先问自己“每天结束时有几种状态？”

对于买卖股票，我们只关心**手里有没有股票**（因为一次只能持有一股）。所以，在每一天结束时，你的状态**只有两种**：

1. **状态 0**：今天结束后，**手里没有股票**（现金最多）。
2. **状态 1**：今天结束后，**手里持有股票**（花出去了一部分钱，但可能未来会涨）。

> **核心认知**：我们不需要关心“今天买了没”、“今天卖了没”，我们只关心**这一天结束时，口袋里的现金（利润）是多少**，且处于哪个状态。

#### 第二步：设计 dp 数组（2个维度搞定）

既然每天有 2 种状态，而我们需要遍历每一天，那么 dp 数组自然就是二维的：

- **`dp[i][0]`**：表示第 `i` 天结束后，**手里没有股票**时，获得的最大利润。
- **`dp[i][1]`**：表示第 `i` 天结束后，**手里持有股票**时，获得的最大利润。

#### 第三步：推导状态转移方程（这是最关键的思考过程）

现在我们假设已经知道了第 `i-1` 天（昨天）的结果，来推导第 `i` 天（今天）。

##### 1. 推导 `dp[i][0]`（今天结束没股票）

今天没股票，只有两种可能路径：

- **昨天就没股票，今天啥也没干**：利润就是 `dp[i-1][0]`。
- **昨天有股票，今天把它卖掉了**：今天卖掉了，手里就多了 `prices[i]` 的钱。那么利润就是 `昨天有股票的利润 + 今天的价格`，即 `dp[i-1][1] + prices[i]`。

我们要取最大值，所以：

> **`dp[i][0] = max(dp[i-1][0], dp[i-1][1] + prices[i])`**

##### 2. 推导 `dp[i][1]`（今天结束持有股票）

今天有股票，也只有两种可能路径：

- **昨天就有股票，今天啥也没干（继续持有）**：利润就是 `dp[i-1][1]`。
- **昨天没股票，今天买入了**：今天买入要花掉 `prices[i]` 的钱，利润减少。那么利润就是 `昨天没股票的利润 - 今天的价格`，即 `dp[i-1][0] - prices[i]`。

取最大值：

> **`dp[i][1] = max(dp[i-1][1], dp[i-1][0] - prices[i])`**

#### 第四步：初始化（第 0 天的边界情况）

我们需要知道第 0 天开始前的状态：

- `dp[0][0]`（第0天结束没股票）：如果在第0天啥也不干，利润就是 **0**。`dp[0][0] = 0`
- `dp[0][1]`（第0天结束持有股票）：说明在第0天当天买入了，利润是 `-prices[0]`（本金视为0，花掉了这么多钱）。`dp[0][1] = -prices[0]`

#### 第五步：确定答案

我们遍历完最后一天（`n-1`）后，**手里肯定没有股票时利润最大**（因为股票不卖掉就不算落袋，且题目不要求必须持有）。
所以答案是：

> **`return dp[n-1][0]`**

```python
class Solution:
  def maxProfit(self,prices:List[int]) -> int:
    n = len(prices)
    if n<2:
      return
    
    dp = [ [0,0] for _ in range(n) ]
    dp[0][0],dp[0][1] = 0,-prices[0]
    for i in range(1,n):
      dp[i][0] = max(dp[i-1][0], dp[i-1][1]+prices[i])
      dp[i][1] = max(dp[i-1][1], dp[i-1][0]-prices[i])
    return dp[n-1][0]
```

### 55. 跳跃游戏

> 给你一个非负整数数组 `nums` ，你最初位于数组的 **第一个下标** 。数组中的每个元素代表你在该位置可以跳跃的最大长度。
>
> 判断你是否能够到达最后一个下标，如果可以，返回 `true` ；否则，返回 `false` 。

只维护一个值：能走到最远的位置**max_len**，一旦**max_len**在遍历过程中，小于i，那么就永远到不了终点。

```python
class Solution:
    def canJump(self, nums: List[int]) -> bool:
      max_len = nums[0]
      destination = len(nums) - 1
      for i in range(1,destination+1):
        if max_len >= destination:
          return True
        elif max_len < i:
          return False
        else:
          max_len = max(max_len,i+nums[i])
      return True
```

### 45. 跳跃游戏II

> 给定一个长度为 `n` 的 **0 索引**整数数组 `nums`。初始位置在下标 0。
>
> 每个元素 `nums[i]` 表示从索引 `i` 向后跳转的最大长度。换句话说，如果你在索引 `i` 处，你可以跳转到任意 `(i + j)` 处：
>
> - `0 <= j <= nums[i]` 且
> - `i + j < n`
>
> 返回到达 `n - 1` 的最小跳跃次数。测试用例保证可以到达 `n - 1`。

💡方法一（贪心）：

我们反过来想，从终点开始，寻找能到达终点的”最贪“的跨越位置，找到便将终点**更新为此位置**(易错)，进入下一轮。注意，**寻找**的过程可以如何处理？首先想到的是和终点一样的遍历方式，即从后往前遍历，但是一般情况下，肯定是需要找到一个临界点i使得i+nums[i] >= index_destination 且 i-1 +nums[i-1] < index_destination，但是，对于**寻找**，我们可以正向遍历，这样一来，只要满足i + nums[i] >= index_destination的第一个i，就是最贪的i。

代码如下：

```
class Solution:
    def jump(self, nums: List[int]) -> int:
        destination = len(nums) - 1
        steps = 0
        while destination > 0:
        		for i in range(destination):
        				if i + nums[i] >= destination:
        						steps += 1
        						destination = i	# 注意是destination = 1（更新为此位置） 而非 destination -= nums[i]
       							break
        return steps
```

方法一很直观，从destination开始从后往前。但时间复杂度是O(n^2)

如果从前往后，维护一个能到的最远的位置。比如当前的位置是 i，nums[i]是k。那么能到的最远的地方是max( i + j + nums[j]) j∈[1,k]。每一步都选取能到的最远的位置。

```
```

### 274.H指数

> 给你一个整数数组 `citations` ，其中 `citations[i]` 表示研究者的第 `i` 篇论文被引用的次数。计算并返回该研究者的 **`h` 指数**。
>
> 根据维基百科上 [h 指数的定义](https://baike.baidu.com/item/h-index/3991452?fr=aladdin)：`h` 代表“高引用次数” ，一名科研人员的 `h` **指数** 是指他（她）至少发表了 `h` 篇论文，并且 **至少** 有 `h` 篇论文被引用次数大于等于 `h` 。如果 `h` 有多种可能的值，**`h` 指数** 是其中最大的那个。

 

