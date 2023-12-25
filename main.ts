const deadPing = 20000;
const lostPing = 10000;

// Record für Client
interface Client {
    id: number;
    sprite: game.LedSprite;
    ping: number;
}

// Array der Clients
const clients: Client[] = [];


function getClient(id: number): Client {

    if (!id)
        return undefined;
    // client in array suchen
    for (const client of clients)
        if (client.id == id)
            return client;

    // max 24 Clients möglich
    const n = clients.length;
    if (n == 24)
        return undefined;

    // neuen Client zusammensetzen
    const client: Client = {
        id: id,
        // pixel x und y in der 5x5 Matrix
        sprite: game.createSprite(n % 5, n / 5),
        ping: input.runningTime()
    }

    // neuen Client hinten anfügen und zurückgeben
    clients.push(client); 
    return client;
}


radio.onReceivedNumber(
    function (receivedNumber) {
        const serialNumber = radio.receivedPacket(RadioPacketProperty.SerialNumber)
        const client = getClient(serialNumber);
        if (!client)
            return;

        client.ping = input.runningTime()
        client.sprite.setBrightness(Math.max(1, receivedNumber & 0xff));
    }
)

basic.forever(() => {
    music.tonePlayable(Note.F, music.beat(BeatFraction.Quarter));
    const now = input.runningTime()
    for (const client of clients) {
        // lost signal starts blinking
        const lastPing = now - client.ping;
        if (lastPing > deadPing) {
            client.sprite.setBlink(0)
            client.sprite.setBrightness(0)
        }
        else if (lastPing > lostPing)
            client.sprite.setBlink(500);
        else
            client.sprite.setBlink(0);
    }
    basic.pause(500)
})

// setup the radio and start!
music.tonePlayable(Note.A, music.beat(BeatFraction.Quarter));

radio.setGroup(4)
game.addScore(1)