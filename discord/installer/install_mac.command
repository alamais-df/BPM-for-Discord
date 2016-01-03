DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

#if [ -z $(which node) ]; then
    echo "Cannot find node, downloading standalone binary..."
    curl -o node.tar.gz https://nodejs.org/dist/v4.2.4/node-v4.2.4-darwin-x64.tar.gz
    echo "Unpacking node..."
    tar --strip-components=2 -xvf node.tar.gz -C $DIR node-v4.2.4-darwin-x64/bin/node
    echo "Node unpacked, running installer..."
    $DIR/node $DIR/index.js $DIR
    echo "Removing node tarball and extract..."
    rm -rf $DIR/node
    rm -f $DIR/node.tar.gz
else
    echo "Found node, running with local version...";
    echo "Node version is: "
    node --version
    node $DIR/index.js $DIR
fi

echo "Press enter to continue..."
read BLANK

