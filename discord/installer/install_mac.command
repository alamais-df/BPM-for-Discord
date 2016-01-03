DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

if [ -z $(which node) ]; then
    echo "Cannot find node, downloading standalone binary..."
    curl -o node.tar.gz https://nodejs.org/dist/v4.2.4/node-v4.2.4-darwin-x64.tar.gz
    echo "Unpacking node..."
    mkdir -p node_extract
    tar xvzf node.tar.gz -C extracted_node_binary/
    echo "Node unpacked, running installer..."
    extracted_node_binary/node-v4.2.4-darwin-x64/bin/node $DIR/index.js $DIR
    echo "Removing extracted node install..."
    rm -rf extracted_node_binary
else
    echo "Found node, running with local version...";
    echo "Node version is: "
    node --version
    node $DIR/index.js $DIR
fi

echo "Press enter to continue..."
read BLANK

