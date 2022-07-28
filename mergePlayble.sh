#!/bin/bash
# 用来删除合并子模块playable到当前项目中
while true; do
    read -p "这个命令将会合并playable子模块到当前项目中，此操作不可逆，请输入yes继续执行：" yn
    case $yn in
        [Yy]es ) break;;
        [Nn]o ) exit;;
        * ) echo "请输入 yes 或者 no.";;
    esac
done
submodule_path=assets/scripts/playable &&\
git rm --cached $submodule_path &&\
git config -f .gitmodules --remove-section submodule.$submodule_path &&\
git config -f .git/config --remove-section submodule.$submodule_path &&\
git add .gitmodules &&\
rm -rf $submodule_path/.git &&\
rm -rf .git/modules/$submodule_path &&\
git add $submodule_path &&\
git commit -m "Remove submodule playable" &&\
read -n 1 -s -r -p "playable子模块已经合并到当前项目，请手动推送一下，按回车键退出！"