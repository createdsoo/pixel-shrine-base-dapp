// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract PixelShrine {
    uint256 public nextCharmId = 1;

    struct CharmEntry {
        address keeper;
        string title;
        string symbol;
        string colorA;
        string colorB;
        string note;
        uint256 createdAt;
    }

    mapping(uint256 => CharmEntry) private charms;

    event CharmMinted(
        uint256 indexed charmId,
        address indexed keeper,
        string title,
        string symbol,
        string colorA,
        string colorB,
        string note
    );

    function mintCharm(
        string calldata title,
        string calldata symbol,
        string calldata colorA,
        string calldata colorB,
        string calldata note
    ) external returns (uint256 charmId) {
        require(bytes(title).length > 0 && bytes(title).length <= 32, "Invalid title");
        require(bytes(symbol).length > 0 && bytes(symbol).length <= 12, "Invalid symbol");
        require(bytes(colorA).length > 0 && bytes(colorA).length <= 16, "Invalid color A");
        require(bytes(colorB).length > 0 && bytes(colorB).length <= 16, "Invalid color B");
        require(bytes(note).length > 0 && bytes(note).length <= 180, "Invalid note");

        charmId = nextCharmId++;
        charms[charmId] = CharmEntry({
            keeper: msg.sender,
            title: title,
            symbol: symbol,
            colorA: colorA,
            colorB: colorB,
            note: note,
            createdAt: block.timestamp
        });

        emit CharmMinted(charmId, msg.sender, title, symbol, colorA, colorB, note);
    }

    function getCharm(
        uint256 charmId
    )
        external
        view
        returns (
            address keeper,
            string memory title,
            string memory symbol,
            string memory colorA,
            string memory colorB,
            string memory note,
            uint256 createdAt
        )
    {
        CharmEntry storage entry = charms[charmId];
        return (
            entry.keeper,
            entry.title,
            entry.symbol,
            entry.colorA,
            entry.colorB,
            entry.note,
            entry.createdAt
        );
    }
}
