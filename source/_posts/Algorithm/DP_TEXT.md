---
title: Dynamic Programming
date: {{date}}
hidden: true
tags:
- 算法基础
- 动态规划
categories:
- [算法, 算法基础]

---



# Dynamic Programming

> 1. dp数组设计和初始化 
> 2. 状态转移方程设计 
> 3. 举例并反推 

<!-- more -->

## 整数拆分

>整数N分解成不超过K的自然数的和，求拆分方案的个数：

分析：设有F(N,K)表示最终结果。容易知道：`F(1,x)=1 and F(x,1)=1`
当N<K 时：`F(N,K)=F(N,N)` 
当N=K 时：可以考虑将整数就分解为他本身这一种方案 和 F(N,K-1) 有：`F(N,K)=1+F(N,K-1)`
当N>K 时：可以分类讨论拆分的数中是否包含K，若包含：则其余的数的和必然为:N-K 现在只需要考虑N-K如何拆分即可，故有：F(N-K,K)；若不包含：则拆分可以转变为：F(N,K-1) 有：`F(N,K)=F(N,K-1)+F(N-K,K)`
因此：![](https://s3.bmp.ovh/imgs/2023/11/21/aa143084b1426144.png)
设DP[n][k]为答案。因此源程序如下

```c++
#include <iostream>
using namespace std;
const int N = 10000;
int dp[N][N];

void solution(int n, int k) {
	for(int i=1;i<=n;i++)
		for (int j = 1; j <= k; j++) {
			if (i == 1 or j == 1)
				dp[i][j] = 1;
			else if (i > j)
				dp[i][j] = dp[i][j - 1] + dp[i - j][j];
			else if (i == j)
				dp[i][j] = 1 + dp[i][j - 1];
			else
				dp[i][j] = dp[i][i];
		}
}

int main() {
	int n=0, k=0;
	cin >> n>> k;
	solution(n, k);
	cout << dp[n][k];
}
```
## 最大连续子序列和问题
>一段数字序列 求其中的最大连续和子序列

分析：问题分成两部分：求值，构建具体的序列。
设dp[N]为包括Sequence[N-1]往前的最大连续子序列和。
关键在于找状态转移方程：`dp[N]=max{dp[N-1]+Sequence[N-1],Sequence[N-1]}`
Sequence[N-1]为序列数组末尾元素。
且一定有边界条件：`dp[0]=0`,没有所谓的前0个元素，是从1开始确定的，这里只是个主观规定。

通过dp很容易求出最大连续子序列和，但是要考虑如何通过这个结果构造出具体的子序列.
>***从抽象入手总是困难，不妨设置一些用例来帮助分析，写算法就是如此，这样的用例可能无法覆盖所有的情况，所有就有了一个叫做debug的工作来完善你的算法思想。***

设-2 11 -4 13 -5 -2
则dp[1]=max{0-2，-2}=-2；
dp[2]=max{-2+11,11}=11;
dp[3]=max{11-4,-4}=7;
dp[4]=max{7+13,13}=20;
dp[5]=max{20-5,-5}=15;
dp[6]=max{15-2,-2}=13.

最大的DP为20，最大子序列为11 -4 13。根据这个例子：若dp一开始为负数，则后来一旦出现正数，那么那个负数就不会再计入在最大子序列中，因此那个负数就是临界处。每一次dp的负数，都是对连续子序列的一次重新选择。
源程序如下：

```c++
#include <iostream>
#include <algorithm>
using namespace std;
int dp[1000];

void solution(int* s,int n) {
	dp[0] = 0;
	for (int i = 1; i <= n; i++)
		dp[i] = max( dp[i - 1] + s[i],s[i]);
}

void display(int *s,int n) {
	int dpMax=1;
	for (int i = 0; i <= n; ++i) {
		if (dp[i] > dp[dpMax])
			dpMax = i;//记录其下标
	}
	cout << "最大连续子序列和为:" << dp[dpMax];
	int start = 0;
	for (int i = dpMax; i >= 0; i--)
	{
		if (dp[i] <= 0) {
			start = i;
			break;
		}	
	}
	cout << endl << "子序列为：";
	for (int i = start+1; i <= dpMax; ++i)
		cout << s[i] << " ";
}

int main() {
	int n = 0;
	cin >> n;
	int* S = new int[n];
	for (int i = 0; i < n; ++i)
		cin >> S[i];
	solution(S,n);
	display(S,n);
}
```
>变式：连续最长数字串：读入一个字符串str，求出str中连续最长的数字串的长度。
如：abasjdbkjan1212ksnksn1221213213123；的连续最长数字串为1221213213123。
来源：P295
## 最长公共子序列
>两个序列A B，求他们的最长的公共子序列C

设A=(a0,a1...am-1) B=(b0,b1...bn-1) C=(c0,c1...cz-1)
若 am-1=bn-1 则 cz-1=am-1=bn-1
若 am-1!=bn-1 and cz-1!=am-1 C此时为a0..am-2 和 b0..bn-1的最长公共子序列
若 am-1!=bn-1 and cz-1!=bm-1 C此时为a0..am-1 和 b0..bn-2的最长公共子序列
因此对于am-1!=bn-1的case C最终应是两种情况的最大值。
设dp[i][j]为a0..ai-1 与 b0..bj-1的最长公共子序列长度
则有
`dp[i][j]=0   i=j=0
dp[i][j]=1+d[i-1][j-1]  ai-1=bj-1
dp[i][j]=max{dp[i][j-1],dp[i-1][j]} ai-1!=bj-1`
这里又要涉及两个问题：求长度和求具体的序列。
考虑何时会使得公共序列中的元素+1?就是若 am-1=bn-1 则 cz-1=am-1=bn-1,因此关键在于找到dp[i][j]，此时的i j能做出实质性的改变，也即跳过那些非公共元素，非公共元素不会影响dp[][]的值，因此对于相同行和列相邻且相同的dp[][]直接跳过，那些元素不是公共元素。
源程序如下：

```c++
#include <iostream>
#include <algorithm>
#include <vector>
using namespace std;

int dp[1000][1000];
void solution(char* a, char* b, int m, int n) {
	//边界初始化
	for (int i = 0; i <= m; ++i) {
		dp[i][0] = 0;
	}
	for (int i = 0; i <= n; ++i) {
		dp[0][i] = 0;
	}
	//状态转换
	for(int i=1;i<=m;i++)
		for (int j = 1; j <=n; j++) {
			if (a[i - 1] == b[j - 1])
				dp[i][j] = dp[i - 1][j - 1]+1;
			else
				dp[i][j] = max(dp[i][j - 1], dp[i - 1][j]);
		}
}

void display(char* a, char* b, int m, int n) {
	vector <char> aimStr;
	int k = dp[m][n];
	int i = m;
	int j = n;
	while (k>0) {
		if (dp[i][j] == dp[i - 1][j])
			--i;
		else if (dp[i][j] == dp[i][j - 1])
			--j;
		else
		{
			aimStr.push_back(a[i - 1]);
			--i; --j; --k;
		}
	}
	cout << "长度为：" << dp[m][n];
	cout << endl << "序列为:"<<endl;
	vector <char>::reverse_iterator rit;
	for (rit = aimStr.rbegin(); rit != aimStr.rend(); ++rit)
		cout << *rit << " ";

}

int main()
{
	int m = 0, n = 0;
	cout << "input m,n";
	cin >> m >> n;
	char* A = new char[m];
	char* B = new char[n];
	cout << "input string A" << endl;
	for (int i = 0; i < m; ++i)
		cin >> A[i];
	cout << "input string B" << endl;
	for (int i = 0; i < n; ++i)
		cin >> B[i];
	solution(A, B, m, n);
	display(A,B,m,n);
}
```
>变式：求两个字符串A B的最长公共连续子串
来源P302
## 最长递增子序列
>字面意思 注意:不必连续

到现在已经写了三个问题了，不难发现dp是一种思想，最关键在于状态的设置及其转换，分类讨论的思想也举足轻重。
假定有序列：1 2 3 0 1 5 2 3 4
结果是：0 1 2 3 4（不必连续，跳过5）
首先要知道最长长度，其次是去构造。
**设dp[i]为序列中以s[i]之前的最长递增子序列**
则有
**dp[i]=1 and dp[i]=max{dp[i],dp[j]+1},a[i]>a[j] 0<=i<=n-1 0<=j<=i-1**
明显需要用到以外层循环定界的二重循环
源程序如下：

```c++
#include <iostream>
#include<algorithm>
using namespace std;

int dp[1000];
void solution(int *s,int n,int& ans) {
	for (int i = 0; i < n; ++i)
	{
		dp[i] = 1;
		for (int j = 0; j < i; j++)
		{
			if (s[i] > s[j])
				dp[i] = max(dp[i], dp[j] + 1);
		}
	}
	for (int i = 1; i < n; ++i)
		ans = max(ans,dp[i]);
}

int main() {
	int n = 0;
	cin >> n;
	int* S = new int[n];
	for (int i = 0; i < n; ++i)
		cin >> S[i];
	int ans = 1;
	solution(S, n,ans);
	cout << ans;
}
```
## 序列编辑问题
>将A串编辑成B串的最小步数，操作方法有：删字符 插字符 换字符

**设dp[i][j]为将A串的前i个元素编辑成B串的前j个元素所用的最少步数**
分析:若A[i-1]=B[j-1] 则不必理会 **dp[i][j]=dp[i-1][j-1]**;
若A[i-1]!=B[j-1] 则可以通过三种方式完成：
1.将A[i-1]换成B[i-1]：dp[i][j]=1+dp[i-1][j-1];
2.插入B[j-1]：dp[i][j]=1+dp[i][j-1];
3.删除A[i-1]：dp[i][j]=1+dp[i-1][j];
最终的结果是去这三种不同操作的最小值：**dp[i][j]=1+min{dp[i-1][j-1],dp[i][j-1],dp[i-1][j]}**
同时还有边界条件：当A为空时，则插入B.length次,当B为空时，则删除B.length次
**dp[x][0]=x,dp[0][x]=x**

源程序如下：
```c++
#include <iostream>
#include <algorithm>
using namespace std;

int dp[1000][1000];

void solution(char* A, char* B, int m, int n) {
	for (int i = 1; i < m; i++)
		dp[i][0] = i;
	for (int i = 1; i < m; i++)
		dp[0][i] = i;
	for(int i=1;i<=m;++i)
		for (int j = 0; j <= n; j++)
		{
			if (A[i - 1] == B[j - 1])
				dp[i][j] = dp[i - 1][j - 1];
			else
				dp[i][j] = 1 + min(min(dp[i-1][j],dp[i][j-1]), dp[i - 1][j - 1]);
		}
}

int main() {
	int m=0, n=0;
	cin >> m >> n;
	char* A = new char[m];
	char* B = new char[n];
	cout << "input A\n";
	for (int i = 0; i < m; i++)
		cin >> A[i];
	cout << "input B\n";
	for (int i = 0; i < n; i++)
		cin >> B[i];
	solution(A, B, m, n);
	cout << "min edit step: " <<dp[m][n] ;
}
```
## 01背包
>n种物品 每种物品都有其重量和价值 每种物品只有一个 在限定总重W下尽可能获得最大的价值。

给物品标上序号：x1...xn x为1则是拿走该物品，为0则不拿走
设dp[i][j]表示当容量为j时，物品1-i装入背包的最高价值。
dp[i][0]=0 dp[0][j]=0 dp[i][j]=max{dp[i-1][j-w[i]]+v[i],dp[i-1][j]}
问题的解为dp[n][W];
设n=5 W=10 w[5]={2,2,6,5,4} v[5]={6,3,5,4,6} 下标从1开始 
dp[1][1]:1个物品1个重量：   重量不够 只能不选                     价值：0
dp[1][2]:1个物品2个重量：   重量足够 决策max{dp[0][0]+6,dp[0][2]} 价值：6
dp[1][3]:1个物品3个重量：   重量足够 决策max{dp[0][1]+6,dp[0][3]} 价值：6
dp[1][4]:1个物品4个重量：   重量足够 决策max{dp[0][2]+6,dp[0][4]} 价值：6
dp[1][5]:1个物品5个重量：   重量足够 决策max{dp[0][3]+6,dp[0][5]} 价值：6
dp[1][6]:1个物品6个重量：   重量足够 决策max{dp[0][4]+6,dp[0][6]} 价值：6
dp[1][7]:1个物品7个重量：   重量足够 决策max{dp[0][5]+6,dp[0][7]} 价值：6
dp[1][8]:1个物品8个重量：   重量足够 决策max{dp[0][6]+6,dp[0][8]} 价值：6
dp[1][9]:1个物品9个重量：   重量足够 决策max{dp[0][7]+6,dp[0][9]} 价值：6
dp[1][10]:1个物品10个重量： 重量足够 决策max{dp[0][8]+6,dp[0][10]} 价值：6

dp[2][1]:2个物品1个重量：   重量不够 只能不选                      价值：0
dp[2][2]:2个物品2个重量：   重量足够 决策max{dp[1][0]+3,dp[1][2]}  价值：6
dp[2][3]:2个物品3个重量：   重量足够 决策max{dp[1][1]+3,dp[1][3]}  价值：6
dp[2][4]:2个物品4个重量：   重量足够 决策max{dp[1][2]+3,dp[1][4]}  价值：9
dp[2][5]:2个物品5个重量：   重量足够 决策max{dp[1][3]+3,dp[1][5]}  价值：9
dp[2][6]:2个物品6个重量：   重量足够 决策max{dp[1][4]+3,dp[1][6]}  价值：9
dp[2][7]:2个物品7个重量：   重量足够 决策max{dp[1][5]+3,dp[1][7]}  价值：9
dp[2][8]:2个物品8个重量：   重量足够 决策max{dp[1][6]+3,dp[1][8]}  价值：9
dp[2][9]:2个物品9个重量：   重量足够 决策max{dp[1][7]+3,dp[1][9]}  价值：9
dp[2][10]:2个物品10个重量：   重量足够 决策max{dp[1][8]+3,dp[1][10]}  价值：9
dp[3][1]:3个物品1个重量：   重量不够 只能不选                      价值：0

跟着dp设计分析一遍发现：还真是~ 验证一下最终结果?dp[5][10]=max{dp[4][10],dp[4][10-w[4]]+v[4]}...以此类推
>01背包问题，只要记住dp的设计即可。其他只要你验证就发现是对的，也不难，但是麻烦，只要牢记这样子做是对的，就这样做即可。都是前辈们铺好了的路。
另一个值得考虑的问题是，如何构造出具体的方案，每个dp总是这样，通过设计dp数组和递推方程给出结果，但具体的方案，一般是通过dp的设计思路并结合最终结果**反推**得到的：
源程序：
```c++
#include <iostream>
using namespace std;
const int n=5;
const int W=10;
const int w[n+1] = {0,2,2,6,5,4};//下标为0的不用 不然不便于展现清晰的思路
const int v[n+1] = {0,6,3,5,4,6};
bool x[n + 1] = { false };//表示编号为下标的背包有没有被选 0就是选了 1就是没选 便于输出方案

int dp[1000][1000];

void Knap01() {
	//先写边界条件，发现其他dp也都是如此
	for (int i = 0; i <= n; i++)
		dp[i][0] = 0;
	for (int i=0;i<=W;i++)
		dp[0][i] = 0;
	//然后由递推方程构建dp各项
	for (int i = 1; i <= n; i++)
	{
		//leftWeight为可用的重量
		for (int leftWeight = 1; leftWeight <= W; leftWeight++)
		{
			if (leftWeight < w[i])//可用重量小于当前物品重量 则不可选
				dp[i][leftWeight] = dp[i - 1][leftWeight];
			else
			{
				dp[i][leftWeight] = max(dp[i-1][leftWeight],dp[i-1][leftWeight-w[i]]+v[i]);
			}
		}
	}
}

void choose() {
	//已经求出了dp各项，现要根据dp项构造出选择方案；根据之前的分析发现：如果因为决策没选择和因为重量不够而不选择，他们的结构都一样
	//他们的递推式都一样，因为原因不重要，重要的是你到底选没有选择。因此，只要你没有选择，我就要使用对应的递推方程；
	//反过来说，要是你满足某个递推方程，那么你就一定没被选，再进一步，如果你不满足那个递推式，那你就一定被选了。
	//循环的边界情况都已经考虑好了，因此只要记住即可
	int i = n;
	int leftWeight = W;
	while (i >= 0) {
		if (dp[i][leftWeight] != dp[i - 1][leftWeight])
		{
			x[i] = true;
			leftWeight -= w[i];
		}
		else
		{
			x[i] = false;
		}
		i--;
	}
}

int main() {
	Knap01();
	choose();
	cout << "选择的物品编号：\n";
	for (int i = 1; i <= n; ++i)
	{
		if (x[i] == 1)
			cout << i<<" ";
	}
	cout << "\n总价值为：" << dp[n][W];
}
```
## 完全背包
>在01背包的基础上:那些物品每样都有无穷多个。求此时的最大价值选法。
>真·多重背包问题将在AcWing部分解决。

分析：在01的问题上增设一个属性：物品的数量，dp还是那个dp，dp[i][j]：在重量为j的情况下选择1-i号物品的最大收益，但此时还要增加另一个变量fk[i][j]表示dp[i][j]下i物品选择的数量。

dp[i][j]=max{dp[i-1][j-k*w[i]]+k*v[i],dp[i-1][j]},第一项也是关于K的最大值函数。
设：n=3 W=7 w[4]={0,3,4,2} v[4]={0,4,5,3}
dp[0][x]=dp[x][0]=0
dp[1][1]=0 dp[1][2]=0 dp[1][3]=4(k=1) dp[1][4]=4(k=1) dp[1][5]=4(k=1) d[1][6]=8(k=2) dp[1][7]=8(k=2)

dp[2][1]=0 dp[2][2]=0 dp[2][3]=4 dp[2][4]=max{dp[1][3],dp[1][4-4k]+5k}=5(k=1) dp[2][5]=max{dp[1][5],dp[1][5-4k]+5k}=5(k=1) dp[2][6]=max{8,5}=8(k=2,0) dp[2][7]=max{8,5}=8(k=2,0)...

源程序如下：
```c++
#include <iostream>
using namespace std;
const int W = 7;
const int n = 3;
const int v[n+1] = { 0,4,5,3 };
const int w[n+1] = { 0,3,4,2 };
int fk[1000][1000];
int dp[1000][1000];

void initial() {
	for (int i = 0; i <= n; i++)
		dp[i][0] = 0;
	for (int i = 0; i <= W; i++)
		dp[0][i] = 0;
}

int MaxValue() {
	for(int i=1;i<=n;i++)//背包序号dp的i
		for(int leftWeight=1;leftWeight<=W;leftWeight++)//剩余重量dp的j
			for (int k = 0; k * w[i] <= leftWeight; k++)//数量fk的值
			{
				if (dp[i][leftWeight] < dp[i - 1][leftWeight - k * w[i]] + k * v[i])//找出最大值对应的K
				{
					dp[i][leftWeight] = dp[i-1][leftWeight-k*w[i]]+k*v[i];
					fk[i][leftWeight] = k;
				}
			}
	cout << "最大价值是：" << dp[n][W];
	return dp[n][W];
}

void choose() {
	int i = n, leftWeight = W;
	while (i >= 1) {
		cout <<endl<< "物品" << i << "拿走了" << fk[i][leftWeight] << "件数";
		leftWeight -= fk[i][leftWeight] * w[i];
		--i;
	}
}

int main() {
	initial();
	MaxValue();
	choose();
}
```

## 资源分配
>将有限的资源分配给有限的使用者，使得总收益最大。是完全背包问题的变式

## 会议安排
## 滚动数组
>dp数组项在构建时，往往只会利用前几项，或者说，某一项只会在构建出其后几项被利用，如果最终的结果只要求最终项，那么很多项在被利用后是可以抛弃的，这部分空间完全是浪费了，因此设置滚动数组压缩存储空间。一般是通过取模运算完成。

举例：斐波那列数列的dp数组 **元素依赖跨度**为3 设置dp[3]
于是dp[i%3]=dp[(i-2)%3]+dp[(i-1)%3]
01Knap 元素依赖跨度为第一维的i 跨度为2 设置dp[2][j]
前者的值只有0,1 可以考虑取模但很傻，可以考虑用初始x=0；之后x=1-x；代替取模运算，核心不变，就是通过手段将数组存储空间压缩为其元素依赖跨度即可。

