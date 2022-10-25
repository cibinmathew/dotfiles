# https://github.com/junegunn/fzf/wiki/Examples#git

# fco_preview - checkout git branch/tag, with a preview showing the commits between the tag/branch and HEAD
fco_preview() {
  # https://github.com/junegunn/fzf/wiki/Examples
  local tags branches target
  
  branches=$(
    git for-each-ref --color=always --count=30 --sort=-committerdate --format="%(color:green)local  \t| %(color:red) %(committerdate:relative) %(color:magenta) |%(refname:short)\t\t|%(color:reset)  %(authorname) %09 %(color:red) |%(subject) %(color:reset)" refs/heads/
    git for-each-ref --color=always --count=30 --sort=-committerdate --format="%(color:green)remote \t| %(color:red) %(committerdate:relative) %(color:magenta) |%(refname:short)\t\t|%(color:reset)  %(authorname) %09 %(color:red) |%(subject) %(color:reset)" refs/remotes/ # refs/remotes/origin
    `# git --no-pager branch --all --sort=-committerdate ` \
      `# --format="%(if)%(HEAD)%(then)%(else)%(if:equals=HEAD)%(refname:strip=3)%(then)%(else)%1B[0;34;1mbranch%09%1B[m%(refname:short)%(end)%(end)" ` \
    | sed '/^$/d') || return

  # echo "$branches"
  tags=$(
    git --no-pager tag | awk '{print "\x1b[35;1mtag\x1b[m\t" $1}'
  ) || return
  target=$(
    (
      echo "$branches"
      echo "$tags"
    ) | fzf --no-hscroll --no-multi --header '?: patch' -n 3 --delimiter='\|' --ansi --bind '?:preview:git log -p --color=always {3}' --preview="git --no-pager log --color=always  -150 --format='%C(auto)%h%d %s %C(black)%C(bold)%cr% C(auto)%an' $(tr -d '[[:blank:]]' <<<{3})" | cut -f 3 -d'|' | tr -d '[[:blank:]]'
  ) || return

  if [[ "$target" = "" ]]; then
    echo "Cancelling as no selection"
    return
  fi

  if [[ "$target" = 'origin/'* ]]; then
    git checkout --track $target
  else
    git checkout $target
  fi
}
