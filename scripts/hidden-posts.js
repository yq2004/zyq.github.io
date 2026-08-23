/* global hexo */

'use strict';

// 博客隐藏功能:
// 当环境变量 HEXO_HIDE=true(npm run deploy 时由 package.json 设置)时,以下内容会被过滤,
// 不出现在部署站点中(首页列表、归档、标签、分类、搜索索引、生成的 HTML 文件全部排除):
//   1. front-matter 中声明 `hidden: true` 的文章与页面;
//   2. 位于 source/_posts 下、名称包含 hidden(不区分大小写)的子文件夹中的文章,
//      该文件夹(含嵌套子文件夹)下的所有文件一并隐藏。
// 此外,隐藏文章关联的分类/标签会被移除,没有可见文章的分类/标签
// 会从分类页、标签页、标签云中彻底消失(有可见子分类的父分类会保留)。
// 本地 npm run server 未设置该变量,隐藏内容正常可见。
//
// 实现说明:
//   1. hexo 7 的 _runGenerators 会在生成器运行前 invalidate locals 缓存,
//      因此必须在数据库 Model 层过滤(before_generate);
//   2. hexo 的模板渲染发生在 _generate 完成之后(generate console 的 firstGenerate 阶段),
//      因此不能在 after_generate 恢复,而是延迟到 before_exit 恢复,
//      并以低优先级保证先于 hexo 内置的 save_database 执行,db.json 不受影响。

var backup = null;

// 判断文章是否位于名称包含 hidden 的文件夹下(_posts 的子文件夹,含嵌套层级)
function isInHiddenFolder(item) {
  var source = item.source || '';
  var parts = source.split(/[\\/]/);
  // 最后一段是文件名,之前的都是文件夹
  for (var i = 0; i < parts.length - 1; i++) {
    if (parts[i].toLowerCase().indexOf('hidden') !== -1) {
      return true;
    }
  }
  return false;
}

function isHidden(item, isPost) {
  if (item.hidden) {
    return true;
  }
  return isPost && isInHiddenFolder(item);
}

// 从 Model 中移除隐藏条目,返回原数据用于恢复
function filterModel(model, isPost) {
  if (!model || !model.length) {
    return null;
  }

  var data = model.data;
  var original = { data: data, length: model.length };

  var filtered = {};
  var count = 0;
  Object.keys(data).forEach(function(id) {
    if (!isHidden(data[id], isPost)) {
      filtered[id] = data[id];
      count++;
    }
  });

  model.data = filtered;
  model.length = count;
  return original;
}

// 从关联表中移除隐藏文章的记录(PostCategory/PostTag),
// 让 cat.length/tag.length 只统计可见文章
function filterLinksModel(model, postIdField, hiddenIds) {
  if (!model || !model.length) {
    return null;
  }

  var data = model.data;
  var original = { data: data, length: model.length };

  var filtered = {};
  var count = 0;
  Object.keys(data).forEach(function(id) {
    if (!hiddenIds[data[id][postIdField]]) {
      filtered[id] = data[id];
      count++;
    }
  });

  model.data = filtered;
  model.length = count;
  return original;
}

// 只保留 id 在 keepIds 中的条目
function filterModelByIds(model, keepIds) {
  if (!model || !model.length) {
    return null;
  }

  var data = model.data;
  var original = { data: data, length: model.length };

  var filtered = {};
  var count = 0;
  Object.keys(data).forEach(function(id) {
    if (keepIds[id]) {
      filtered[id] = data[id];
      count++;
    }
  });

  model.data = filtered;
  model.length = count;
  return original;
}

function restoreModel(model, original) {
  if (!model || !original) {
    return;
  }
  model.data = original.data;
  model.length = original.length;
}

function countHidden(data, isPost) {
  if (!data) {
    return 0;
  }
  return Object.keys(data).filter(function(id) {
    return isHidden(data[id], isPost);
  }).length;
}

// 移除没有可见文章的分类/标签
function filterEmptyTaxonomies() {
  var postCategory = hexo.database.model('PostCategory');
  var postTag = hexo.database.model('PostTag');

  // 有关联链接的分类/标签才保留
  var usedCategoryIds = {};
  Object.keys(postCategory.data).forEach(function(id) {
    usedCategoryIds[postCategory.data[id].category_id] = true;
  });
  var usedTagIds = {};
  Object.keys(postTag.data).forEach(function(id) {
    usedTagIds[postTag.data[id].tag_id] = true;
  });

  // 递归保留有可见子分类的父分类(否则子分类会在列表中失去挂载点)
  var categoryData = hexo.database.model('Category').data;
  var changed = true;
  while (changed) {
    changed = false;
    Object.keys(categoryData).forEach(function(id) {
      var cat = categoryData[id];
      if (usedCategoryIds[id] && cat.parent && !usedCategoryIds[cat.parent]) {
        usedCategoryIds[cat.parent] = true;
        changed = true;
      }
    });
  }

  return {
    category: filterModelByIds(hexo.database.model('Category'), usedCategoryIds),
    tag: filterModelByIds(hexo.database.model('Tag'), usedTagIds)
  };
}

hexo.extend.filter.register('before_generate', function() {
  if (process.env.HEXO_HIDE !== 'true') {
    return;
  }
  if (backup) {
    // 同一进程内多次 generate(如 watch 模式),避免重复过滤已过滤的数据
    return;
  }

  backup = {
    posts: filterModel(hexo.database.model('Post'), true),
    pages: filterModel(hexo.database.model('Page'), false)
  };

  // 计算隐藏文章的 id 集合
  var hiddenIds = {};
  Object.keys(backup.posts.data).forEach(function(id) {
    if (isHidden(backup.posts.data[id], true)) {
      hiddenIds[id] = true;
    }
  });

  // 移除隐藏文章的分类/标签关联,再移除空分类/空标签本身
  backup.postCategory = filterLinksModel(hexo.database.model('PostCategory'), 'post_id', hiddenIds);
  backup.postTag = filterLinksModel(hexo.database.model('PostTag'), 'post_id', hiddenIds);
  var taxonomies = filterEmptyTaxonomies();
  backup.category = taxonomies.category;
  backup.tag = taxonomies.tag;

  var hiddenPosts = countHidden(backup.posts && backup.posts.data, true);
  var hiddenPages = countHidden(backup.pages && backup.pages.data, false);
  hexo.log.info('Hidden posts: %d, hidden pages: %d (HEXO_HIDE=true)', hiddenPosts, hiddenPages);
});

// 注意:不能在 after_generate 恢复!
// hexo 的模板渲染发生在 _generate 完成之后(generate console 的 firstGenerate 阶段),
// 若提前恢复,分类/标签列表页仍会渲染出空分类。因此延迟到进程退出前恢复,
// 并以低优先级保证在 hexo 内置的 save_database(priority 10)之前执行,db.json 不受影响。
hexo.extend.filter.register('before_exit', function() {
  if (!backup) {
    return;
  }
  restoreModel(hexo.database.model('Post'), backup.posts);
  restoreModel(hexo.database.model('Page'), backup.pages);
  restoreModel(hexo.database.model('PostCategory'), backup.postCategory);
  restoreModel(hexo.database.model('PostTag'), backup.postTag);
  restoreModel(hexo.database.model('Category'), backup.category);
  restoreModel(hexo.database.model('Tag'), backup.tag);
  backup = null;
}, -99);
