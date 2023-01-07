## instatllation

```sh
git clone --depth 1 https://github.com/hut/ranger.git && rm -rf ranger/.git
cd ranger
sudo make install
```



# preview tools
    # file for determining file types
    # The python module chardet, in case of encoding detection problems
    # sudo to use the “run as root”-feature
    # img2txt (from caca-utils) for previewing images in ASCII-art
    # highlight for syntax highlighting of code
    # atool for previews of archives
    # lynx, w3m or elinks for previews of html pages
    # pdftotext for pdf previews
    # transmission-show for viewing bit-torrent information
    # mediainfo or exiftool for viewing information about media files

# Plugins:
```sh
git clone --depth 1 https://github.com/laggardkernel/ranger-fzf-marks.git ~/.config/ranger/plugins/fzf-marks
git clone --depth 1 https://github.com/alexanderjeurissen/ranger_devicons ~/.config/ranger/plugins/ranger_devicons
git clone --depth 1 git@github.com:joouha/ranger_tmux.git ~/.config/ranger/plugins/ranger_tmux
pip install trash-cli    


if [[ "$OSTYPE" == darwin* ]]; then
    # macOS:
    # https://www.everythingcli.org/ranger-image-preview-on-osx-with-iterm2/
    brew install libcaca highlight atool lynx w3m elinks poppler transmission mediainfo exiftool
    #    img preview workaround available in above link
    echo "MacOS"  
else
    # if debian
    apt install caca-utils highlight atool w3m w3m-img poppler-utils mediainfo
    # On archlinux, the package is called "w3m", on debian it is "w3m-img"
fi

```