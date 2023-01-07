# https://superuser.com/questions/1048647/how-to-define-new-commands-in-the-ranger-file-manager/1048648
# This is a sample commands.py.  You can add your own commands here.
#
# Please refer to commands_full.py for all the default commands and a complete
# documentation.  Do NOT add them all here, or you may end up with defunct
# commands when upgrading ranger.

# A simple command for demonstration purposes follows.
# -----------------------------------------------------------------------------

from __future__ import absolute_import, division, print_function

# You can import any python module as needed.
import os
import re
from collections import deque
from subprocess import PIPE

import my_functions
# You always need to import ranger.api.commands here to get the Command class:
from ranger.api.commands import Command
my_env= os.environ.copy()  # copy to ensure current process's is not modified
my_env['PATH'] = "/home/cibin/bin:" + my_env['PATH']  # since paths in .bash_profile are not picked by subprocess

# Any class that is a subclass of "Command" will be integrated into ranger as a
# command.  Try typing ":my_edit<ENTER>" in ranger!
class my_edit(Command):
    # The so-called doc-string of the class will be visible in the built-in
    # help that is accessible by typing "?c" inside ranger.
    """:my_edit <filename>

    A sample command for demonstration purposes that opens a file in an editor.
    """

    # The execute method is called when you run this command in ranger.
    def execute(self):
        # self.arg(1) is the first (space-separated) argument to the function.
        # This way you can write ":my_edit somefilename<ENTER>".
        if self.arg(1):
            # self.rest(1) contains self.arg(1) and everything that follows
            target_filename = self.rest(1)
        else:
            # self.fm is a ranger.core.filemanager.FileManager object and gives
            # you access to internals of ranger.
            # self.fm.thisfile is a ranger.container.file.File object and is a
            # reference to the currently selected file.
            target_filename = self.fm.thisfile.path

        # This is a generic function to print text in ranger.
        self.fm.notify("Let's edit the file " + target_filename + "!")

        # Using bad=True in fm.notify allows you to print error messages:
        if not os.path.exists(target_filename):
            self.fm.notify("The given file does not exist!", bad=True)
            return

        # This executes a function from ranger.core.acitons, a module with a
        # variety of subroutines that can help you construct commands.
        # Check out the source, or run "pydoc ranger.core.actions" for a list.
        self.fm.edit_file(target_filename)

    # The tab method is called when you press tab, and should return a list of
    # suggestions that the user will tab through.
    # tabnum is 1 for <TAB> and -1 for <S-TAB> by default
    def tab(self, tabnum):
        # This is a generic tab-completion function that iterates through the
        # content of the current directory.
        return self._tab_directory_content()




class newcmd(Command):
    def execute(self):
        if not self.arg(1):
            self.fm.notify('Wrong number of arguments', bad=True)
            return
        # First argument. 0 is the command name.
        self.fm.notify(self.arg(1))
        # Current directory to status line.
        self.fm.notify(self.fm.thisdir)
        # Run a shell command.
        self.fm.run(['touch', 'newfile'])

# Visit frequently used directories
# https://github.com/ranger/ranger/wiki/Commands
# This command uses fasd to jump to a frequently visited directory with a given substring of its path.

class fasd(Command):
    """
    :fasd

    Jump to directory using fasd
    """
    def execute(self):
        import subprocess
        arg = self.rest(1)
        if arg:
            directory = subprocess.check_output(["fasd", "-d"]+arg.split(), universal_newlines=True).strip()
            self.fm.cd(directory)

## my fzf integration for ag

# cmd recurse/not folderonly/both ext
class fzf_ag_here(Command):
    """
    :fzf_select

    Find a file using fzf.

    With a prefix argument select only directories.

    See: https://github.com/junegunn/fzf
    """
    def execute(self):
        import subprocess
        import os.path
        self.fm.notify(self.arg(1))
        if self.arg(2)=='0': # all extensions
            ext=""
        elif self.arg(2)=='1': # current extension only
            ext='-G' + os.path.splitext(self.fm.thisfile.relative_path)[1][1:] + '$'
        else:
            ext='-G' + self.arg(2) + '$'

        # command="gfind -L " + arg_maxdepth + " -name " + arg_ext + " " +  \
            # arg_type + " -print 2> /dev/null | sed 1d | cut -b3- | fzf --preview 'echo {} | cut -f1 -d':' | gxargs rougify {} | cat {};'"
        if self.arg(1)=="1": # recurse
            command="ag " + ext + " .| fzf --delimiter=: --nth=2..  --header '-------searches only in content------'  --preview 'echo {} | cut -f 1 -d':' | gxargs rougify {} | gxargs cat'"
            self.fm.notify(command)
        else:
            command="ag -n " + ext + " .| fzf --delimiter=: --nth=2.. --header '-------searches only in content------' --preview 'echo {} | cut -f 1 -d':' | gxargs cat'"
            # command="ag -n " + ext + " .| fzf --preview 'echo {} | cut -f 1 -d\":\""
            # command="ag " + ext + " .| fzf" # --preview 'echo {} | cut -f 1 -d':' | gxargs rougify {} | gxargs cat {};'"
            # |[[ $(file --mime {}) =~ binary ]] && \
            #      echo {} is a binary file || \
            #      (bat --style=numbers --color=always {} || \
            #       highlight -O ansi -l {} || \
            #       coderay {} || \
            #       rougify {} || \
            #       cat {})| head -500'"



            # command='ag -n ' + ext + ' .|fzf'
            self.fm.notify(command)
        # return
        # if self.quantifier:
            # match only directories
            # command="gfind -L . \( -path '*/\.*' -o -fstype 'dev' -o -fstype 'proc' \) -prune \
            # -o -type d -print 2> /dev/null | sed 1d | cut -b3- | fzf +m"
        # else:
            # match files and directories
            # command="gfind -L . \( -path '*/\.*' -o -fstype 'dev' -o -fstype 'proc' \) -prune \
            # -o -print 2> /dev/null | sed 1d | cut -b3- | fzf +m"
            # command="ag -n .|fzy"
        fzf = self.fm.execute_command(command, stdout=subprocess.PIPE, env=my_env)
        stdout, stderr = fzf.communicate()
        if fzf.returncode == 0:
            fzf_file, fzf_file_lineno = my_functions.parse_grep_file_path_line(stdout.decode('utf-8').rstrip('\n'))
            fzf_file=os.path.abspath(fzf_file)
            # fzf_file_lineno = os.path.abspath(my_functions.parse_grep_file_path_line(stdout.decode('utf-8').rstrip('\n')))
            self.fm.notify(fzf_file_lineno)

            # added by cbn;
            # extract only the filename from the filename+line+match
            import re
            # self.fm.notify("="+str(fzf_file)+"=")
            # fzf_file_lineno = re.sub(r'([^:]+):(\d+):.*', r'\1', fzf_file.strip())
            # fzf_file = re.sub(r'([^:]+):([^:]+):.*', r'\1',fzf_file)
            if os.path.isdir(fzf_file):
                self.fm.cd(fzf_file)
            else:
                # self.fm.select_file(fzf_file)
                # self.fm.notify("hello")
                # self.fm.execute_console(["vi", str(fzf_file)])
                cmd=["vi", "+{}".format(fzf_file_lineno), str(fzf_file)]
                self.fm.notify(' '.join(cmd))
                self.fm.execute_command(cmd)


    def cibin(self):
        self.fm.notify('df')

## fzf integration
class bash_select(Command):
    """
    :fzf_select

    Find a file using fzf.

    With a prefix argument select only directories.

    See: https://github.com/junegunn/fzf
    """
    def execute(self):
        import subprocess
        import os.path
        # command = self.arg(1)
        command = self.rest(1)

        # self.fm.notify(command)
        fzf = self.fm.execute_command(command, stdout=subprocess.PIPE)
        stdout, stderr = fzf.communicate()
        if fzf.returncode == 0:
            # fzf_file = os.path.abspath(stdout.decode('utf-8').rstrip('\n'))
            # fzf_file = os.path.abspath(stdout.decode('utf-8').strip())
            fzf_file = os.path.abspath(os.path.realpath(os.path.expanduser( stdout.decode('utf-8').strip())))
            self.fm.notify(fzf_file)
            # added by cbn;
            # extract only the filename from the filename+line+match
            import re
            fzf_file = re.sub(r'([^:]+):.+$', r'\1',fzf_file)
            # self.fm.notify(fzf_file)
            if os.path.isdir(fzf_file):
                self.fm.cd(fzf_file)
            else:
                self.fm.select_file(fzf_file)

class fzf_select(Command):

    """
    :fzf_select

    Find a file using fzf.

    With a prefix argument select only directories.

    See: https://github.com/junegunn/fzf
    """
    def execute(self):
        # parameters: recurse maxdepth extensions
        import subprocess
        import os.path

        if self.arg(2)=='0': # all extensions
            arg_ext="'*'"
        elif self.arg(2)=='1': # current extension only
            arg_ext= "'*." + os.path.splitext(self.fm.thisfile.relative_path)[1][1:] + "'"
        else:
            arg_ext='-G' + self.arg(2) + '$'

        # if self.arg(1)=="1": # recurse
            # arg_maxdepth = "-maxdepth 100"
        # else:
            # arg_maxdepth = "-maxdepth 1"
        if not self.arg(1): 
            depth = "3"
        else:
            depth = self.arg(1)
            # arg_maxdepth = "-maxdepth 1"
        arg_maxdepth = "-maxdepth {}".format(depth)
        self.fm.notify(arg_maxdepth)

        if self.arg(3)=="1":  
            arg_type = "-type d "
        else:
            arg_type = " "

        # arg_maxdepth = ""

        # command="gfind -L . " + arg_maxdepth + " \( -path '*/\.*' -o -fstype 'dev' -o -fstype 'proc' \) -prune \
            # -o " + arg_type + " -print 2> /dev/null | sed 1d | cut -b3- | fzf +m"
        command="gfind -L " + arg_maxdepth + " -name " + arg_ext + " " +  \
            arg_type + " -print 2> /dev/null | sed 1d | cut -b3- | fzf --preview 'echo {} | cut -f1 -d':' | gxargs rougify {} | cat {};'"
        # TODO make above working
        command='ls -a|fzf --preview "gxargs cat {}"'
        command='gfind . ' + arg_maxdepth + ' |fzf --preview "gxargs cat {}"'

        # if self.quantifier:
            # match only directories
            # command="gfind -L . \( -path '*/\.*' -o -fstype 'dev' -o -fstype 'proc' \) -prune \
            # -o -type d -print 2> /dev/null | sed 1d | cut -b3- | fzf +m"
        # else:
            # match files and directories
            # command="gfind -L . \( -path '*/\.*' -o -fstype 'dev' -o -fstype 'proc' \) -prune \
            # -o -print 2> /dev/null | sed 1d | cut -b3- | fzf +m"

        fzf = self.fm.execute_command(command, stdout=subprocess.PIPE)
        stdout, stderr = fzf.communicate()
        if fzf.returncode == 0:
            fzf_file = os.path.abspath(stdout.decode('utf-8').rstrip('\n'))
            self.fm.notify(fzf_file)
            if os.path.isdir(fzf_file):
                self.fm.cd(fzf_file)
            else:
                self.fm.select_file(fzf_file)

class cbnfzfcd(Command):
    def execute(self):

        # ranger bookmarks + fzf-marks
        # line format:- description:/path/to/file/or/directtory # extra comments
        command="cat ${HOME}/.fzf-marks ${HOME}/.config/ranger/bookmarks|fzf|cut -d ':' -f 2|cut -d '#' -f 1"
        fzf = self.fm.execute_command(command, stdout=PIPE)
        stdout, stderr = fzf.communicate()
        directory = stdout.decode('utf-8').rstrip('\n')
        self.fm.notify(directory.strip())
        self.fm.cd(directory.strip())

#  https://github.com/ranger/ranger/issues/255


class fzfcd(Command):
    def execute(self):
        command="gfind -L \( -path '*.wine-pipelight' -o -path '*.ivy2*' -o -path '*.texlive*' -o -path '*.git' -o -path '*.metadata' -o -path '*_notes' \) -prune -o -type d -print 2>/dev/null | fzf"
        fzf = self.fm.execute_command(command, stdout=PIPE)
        stdout, stderr = fzf.communicate()
        directory = stdout.decode('utf-8').rstrip('\n')
        self.fm.cd(directory.strip())


class fzfsearch(Command):
    def execute(self):
        command="fd.sh txt"
        fzf = self.fm.execute_command(command, stdout=PIPE)
        stdout, stderr = fzf.communicate()
        directory = stdout.decode('utf-8').rstrip('\n')
        self.fm.cd(directory)
'''
# ~/.config/ranger/commands.py
from ranger.api.commands import *
import ranger.fsobject.directory
original_accept_file = ranger.fsobject.directory.accept_file

# this was copy&pasted from ranger/fsobject/directory.py and modified
# to make filters case insensitive
def insensitive_accept_file(fname, dirname, hidden_filter, name_filter):
    if hidden_filter:
        try:
            if hidden_filter.search(fname):
                return False
        except:
            if hidden_filter in fname:
                return False
    if name_filter and name_filter.lower() not in fname.lower():
        return False
    return True

class filter(Command):
    def quick(self):
        ranger.fsobject.directory.accept_file = original_accept_file
        self.fm.set_filter(self.rest(1))
        self.fm.reload_cwd()

class filter_i(Command):
    def quick(self):
        ranger.fsobject.directory.accept_file = insensitive_accept_file
        self.fm.set_filter(self.rest(1))
        self.fm.reload_cwd()
'''
# https://github.com/ranger/ranger/wiki/Custom-Commands
fd_deq = deque()
class fd_search(Command):
    """:fd_search [-d<depth>] <query>

    Executes "fd -d<depth> <query>" in the current directory and focuses the
    first match. <depth> defaults to 1, i.e. only the contents of the current
    directory.
    """

    def execute(self):
        import subprocess
        from ranger.ext.get_executables import get_executables
        if not 'fd' in get_executables():
            self.fm.notify("Couldn't find fd on the PATH.", bad=True)
            return
        if self.arg(1):
            if self.arg(1)[:2] == '-d':
                depth = self.arg(1)
                target = self.rest(2)
            else:
                depth = '-d1'
                target = self.rest(1)
        else:
            self.fm.notify(":fd_search needs a query.", bad=True)
            return

        # For convenience, change which dict is used as result_sep to change
        # fd's behavior from splitting results by \0, which allows for newlines
        # in your filenames to splitting results by \n, which allows for \0 in
        # filenames.
        null_sep = {'arg': '-0', 'split': '\0'}
        nl_sep = {'arg': '', 'split': '\n'}
        result_sep = null_sep

        process = subprocess.Popen(['fd', result_sep['arg'], depth, target],
                    universal_newlines=True, stdout=subprocess.PIPE)
        (search_results, _err) = process.communicate()
        global fd_deq
        fd_deq = deque((self.fm.thisdir.path + os.sep + rel for rel in
            sorted(search_results.split(result_sep['split']), key=str.lower)
            if rel != ''))
        if len(fd_deq) > 0:
            self.fm.select_file(fd_deq[0])

class fd_next(Command):
    """:fd_next

    Selects the next match from the last :fd_search.
    """

    def execute(self):
        if len(fd_deq) > 1:
            fd_deq.rotate(-1) # rotate left
            self.fm.select_file(fd_deq[0])
        elif len(fd_deq) == 1:
            self.fm.select_file(fd_deq[0])

class fd_prev(Command):
    """:fd_prev

    Selects the next match from the last :fd_search.
    """

    def execute(self):
        if len(fd_deq) > 1:
            fd_deq.rotate(1) # rotate right
            self.fm.select_file(fd_deq[0])
        elif len(fd_deq) == 1:
            self.fm.select_file(fd_deq[0])
fasd_deq = deque()

class fasd(Command):
    """
    :fasd

    Jump to directory using fasd
    """

    def execute(self):
        null_sep = {'arg': '-0', 'split': '\0'}
        nl_sep = {'arg': '', 'split': '\n'}
        result_sep = null_sep
        result_sep['split']='\n'
        import subprocess
        arg = self.rest(1)
        if 1: #arg:
            self.fm.notify('afd ')
            directory = subprocess.check_output(["fasd", "-dl"]+arg.split(), universal_newlines=True).strip()
            self.fm.notify(directory)
            # self.fm.cd(directory)
            # self.fm.notify(len(directory.split('\n')))
            global fasd_deq
            fasd_deq = deque((rel for rel in
                sorted(directory.split(result_sep['split']), key=str.lower)
                if rel != ''))
            if len(fasd_deq) > 0:
                # self.fm.notify(fasd_deq[0])
                pass
            self.fm.notify(len(fasd_deq))
class fasd_next(Command):
    """:fd_next

    Selects the next match from the last :fd_search.
    """

    def execute(self):
        if len(fasd_deq) > 1:
            fasd_deq.rotate(-1) # rotate left
            self.fm.cd(fasd_deq[0])
        elif len(fasd_deq) == 1:
            self.fm.cd(fasd_deq[0])

class fasd_prev(Command):
    """:fd_prev

    Selects the next match from the last :fd_search.
    """

    def execute(self):
        if len(fasd_deq) > 1:
            fasd_deq.rotate(1) # rotate right
            self.fm.cd(fasd_deq[0])
        elif len(fasd_deq) == 1:
            self.fm.cd(fasd_deq[0])


# https://github.com/ranger/ranger/wiki/Custom-Commands
from collections import deque
fd_deq = deque()
class fd_search(Command):
    """:fd_search [-d<depth>] <query>

    Executes "fd -d<depth> <query>" in the current directory and focuses the
    first match. <depth> defaults to 1, i.e. only the contents of the current
    directory.
    """

    def execute(self):
        import subprocess
        from ranger.ext.get_executables import get_executables
        if not 'fd' in get_executables():
            self.fm.notify("Couldn't find fd on the PATH.", bad=True)
            return
        if self.arg(1):
            if self.arg(1)[:2] == '-d':
                depth = self.arg(1)
                target = self.rest(2)
            else:
                depth = '-d1'
                target = self.rest(1)
        else:
            self.fm.notify(":fd_search needs a query.", bad=True)
            return

        # For convenience, change which dict is used as result_sep to change
        # fd's behavior from splitting results by \0, which allows for newlines
        # in your filenames to splitting results by \n, which allows for \0 in
        # filenames.
        null_sep = {'arg': '-0', 'split': '\0'}
        nl_sep = {'arg': '', 'split': '\n'}
        result_sep = null_sep

        process = subprocess.Popen(['fd', result_sep['arg'], depth, target],
                    universal_newlines=True, stdout=subprocess.PIPE)
        (search_results, _err) = process.communicate()
        global fd_deq
        fd_deq = deque((self.fm.thisdir.path + os.sep + rel for rel in
            sorted(search_results.split(result_sep['split']), key=str.lower)
            if rel != ''))
        if len(fd_deq) > 0:
            self.fm.select_file(fd_deq[0])

class fd_next(Command):
    """:fd_next

    Selects the next match from the last :fd_search.
    """

    def execute(self):
        if len(fd_deq) > 1:
            fd_deq.rotate(-1) # rotate left
            self.fm.select_file(fd_deq[0])
        elif len(fd_deq) == 1:
            self.fm.select_file(fd_deq[0])

class fd_prev(Command):
    """:fd_prev

    Selects the next match from the last :fd_search.
    """

    def execute(self):
        if len(fd_deq) > 1:
            fd_deq.rotate(1) # rotate right
            self.fm.select_file(fd_deq[0])
        elif len(fd_deq) == 1:
            self.fm.select_file(fd_deq[0])



# https://github.com/ranger/ranger/wiki/Custom-Commands
from collections import deque
std_deq = deque()
class create_std_queue(Command):
    """:create_std_queue [-d<depth>] <query>

    Executes "fd -d<depth> <query>" in the current directory and focuses the
    first match. <depth> defaults to 1, i.e. only the contents of the current
    directory.
    """

    def execute(self):
        import subprocess
        from ranger.ext.get_executables import get_executables
        # if not 'fd' in get_executables():
            # self.fm.notify("Couldn't find fd on the PATH.", bad=True)
            # return
        # if self.arg(1):
            # if self.arg(1)[:2] == '-d':
                # depth = self.arg(1)
                # target = self.rest(2)
            # else:
                # depth = '-d1'
                # target = self.rest(1)
        # else:
            # self.fm.notify(":create_std_queue needs a query.", bad=True)
            # return

        # For convenience, change which dict is used as result_sep to change
        # fd's behavior from splitting results by \0, which allows for newlines
        # in your filenames to splitting results by \n, which allows for \0 in
        # filenames.
        null_sep = {'arg': '-0', 'split': '\0'}
        nl_sep = {'arg': '', 'split': '\n'}
        result_sep = null_sep
        result_sep['split']='\n'

        process1 = subprocess.Popen(['ag', '-S', '.',],universal_newlines=True, stdout=subprocess.PIPE)
        process2 = subprocess.Popen(['fzf'], universal_newlines=True, stdin=process1.stdout, stdout=subprocess.PIPE)
        (search_results, _err) = process2.communicate()
        self.fm.notify(len (search_results.splitlines()))
        global std_deq
        std_deq = deque((rel for rel in
            sorted(search_results.split(result_sep['split']), key=str.lower)
            if rel != ''))
        # if len(std_deq) > 0:
            # self.fm.select_file(std_deq[0])
        # self.fm.notify(len(std_deq))

class fd_next(Command):
    """:fd_next

    Selects the next match from the last :create_std_queue.
    """

    def execute(self):
        if len(std_deq) > 1:
            std_deq.rotate(-1) # rotate left
            self.fm.select_file(std_deq[0])
        elif len(std_deq) == 1:
            self.fm.select_file(std_deq[0])

class fd_prev(Command):
    """:fd_prev

    Selects the next match from the last :create_std_queue.
    """

    def execute(self):
        if len(std_deq) > 1:
            std_deq.rotate(1) # rotate right
            self.fm.select_file(std_deq[0])
        elif len(std_deq) == 1:
            self.fm.select_file(std_deq[0])

##########
from seanbreckenridge_cmds import fzf_copy_from
# TODO quit_and_cd, mkcd
