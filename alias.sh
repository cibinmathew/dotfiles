# Parenting changing perms on / #
alias chown='chown --preserve-root'
alias chmod='chmod --preserve-root'
alias chgrp='chgrp --preserve-root'

alias chx='chmod --preserve-root +x' 

# show recent
alias lt='ls -lhGgotr | tail -10'

alias lsd='ls -d "$PWD/"*'  # ls with full path

alias r='ranger'
alias fh='ls|fzf'


alias echopath='echo $PATH|sed "s/:/\n/g" |sort'


alias ex='exit'
alias vi='vim'
alias vimv='vim -u NONE'  # vim vanilla

# GIT
alias gitCurBranch='git rev-parse --abbrev-ref HEAD'  # git current branch
alias gfa="git fetch --all"


## a quick way to get out of current directory ##

alias cd.='\cd ..'
alias cd..='\cd ../..'
alias cd...='\cd ../../..'

alias ..='\cd ..'
alias ...='cd ../../../'
alias ....='cd ../../../../'
alias .....='cd ../../../../'
alias .4='cd ../../../../'
alias .5='cd ../../../../..'

alias cd-='\cd -'
alias cd~='\cd ~'
alias cdh='\cd ~;  lt'


alias cdd='\cd $Universal_home/Downloads'
alias cdn="\cd $NOTES_DIR"
alias cdp="\cd $PROJECTS_DIRECTORY"

alias p='cd "$PROJECT_DIRECTORY_CURRENT"'
alias cdpa='cd "$PROJECT_DIRECTORY_CURRENT"'
alias cdpb='\cd "$PROJECT_DIRECTORY_CURRENT2"'
alias cdpc='\cd "$PROJECT_DIRECTORY_CURRENT3"'
alias cdpd='\cd "$PROJECT_DIRECTORY_CURRENT4"'
alias cdpe='\cd "$PROJECT_DIRECTORY_CURRENT5"'
alias cdpf='\cd "$PROJECT_DIRECTORY_CURRENT6"'

# Set cur dir as the project dir
alias setpa="echo 'use: p or cdpa'; export PROJECT_DIRECTORY_CURRENT=\"\$(pwd)\" ; gsed -e s'|^export PROJECT_DIRECTORY_CURRENT=.*|export PROJECT_DIRECTORY_CURRENT='\"\$(pwd)\"'|'   -i $HOME/my-files/configs/config-for-this-system-only.sh"
alias setpb="echo 'use: cdpb';      export PROJECT_DIRECTORY_CURRENT2=\"\$(pwd)\"; gsed -e s'|^export PROJECT_DIRECTORY_CURRENT2=.*|export PROJECT_DIRECTORY_CURRENT2='\"\$(pwd)\"'|' -i $HOME/my-files/configs/config-for-this-system-only.sh"
alias setpc="echo 'use: cdpc';      export PROJECT_DIRECTORY_CURRENT3=\"\$(pwd)\"; gsed -e s'|^export PROJECT_DIRECTORY_CURRENT3=.*|export PROJECT_DIRECTORY_CURRENT3='\"\$(pwd)\"'|' -i $HOME/my-files/configs/config-for-this-system-only.sh"
alias setpd="echo 'use: cdpd';      export PROJECT_DIRECTORY_CURRENT4=\"\$(pwd)\"; gsed -e s'|^export PROJECT_DIRECTORY_CURRENT4=.*|export PROJECT_DIRECTORY_CURRENT4='\"\$(pwd)\"'|' -i $HOME/my-files/configs/config-for-this-system-only.sh"
alias setpe="echo 'use: cdpe';      export PROJECT_DIRECTORY_CURRENT5=\"\$(pwd)\"; gsed -e s'|^export PROJECT_DIRECTORY_CURRENT5=.*|export PROJECT_DIRECTORY_CURRENT5='\"\$(pwd)\"'|' -i $HOME/my-files/configs/config-for-this-system-only.sh"
alias setpf="echo 'use: cdpf';      export PROJECT_DIRECTORY_CURRENT6=\"\$(pwd)\"; gsed -e s'|^export PROJECT_DIRECTORY_CURRENT6=.*|export PROJECT_DIRECTORY_CURRENT6='\"\$(pwd)\"'|' -i $HOME/my-files/configs/config-for-this-system-only.sh"


unameOut="$(uname -s)"
case "${unameOut}" in
    Linux*)     machine=Linux;;
    Darwin*)    machine=Mac;;
    CYGWIN*)    machine=Windows;;
    MINGW*)     machine=Windows;;
    *)          machine="UNKNOWN:${unameOut}"
esac
export machine


if [ "$machine" = "Windows" ]; then
    alias clip='clip'
elif [ "$machine" = "Linux" ]; then
    alias clip='xclip -selection c'
    alias notify='notify-send'
elif [ "$machine" = "Mac" ]; then
    alias clip='pbcopy'
    alias notify='TODO'
fi


# TODO add fzf here